import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

import { RSPrefs } from "@/preferences";

import { Links } from "@readium/shared";

import { FullscreenAction } from "@/components/FullscreenAction";
import { JumpToPositionAction } from "@/components/JumpToPositionAction";
import { SettingsAction } from "@/components/SettingsAction";
import { TocAction } from "@/components/TocAction";
import { ActionComponentVariant, ActionKeys, ActionVisibility } from "@/components/Templates/ActionComponent";

import debounce from "debounce";

export const useCollapsibility = <T extends HTMLElement>(target: T | null, toc: Links) => {
  const observer = useRef<ResizeObserver | null>(null);
  const cachedParentWidth = useRef<number>(0);

  const collapsibleKeys = useRef<ActionKeys[]>([]);
  const collapsedKeys = useRef<ActionKeys[]>([]);

  const [ActionIcons, setActionIcons] = useState<React.JSX.Element[]>([]);
  const actionIconsMap = useRef<Map<ActionKeys, React.JSX.Element>>(new Map());

  const [MenuItems, setMenuItems] = useState<React.JSX.Element[]>([]);
  const menuItemsMap = useRef<Map<ActionKeys, React.JSX.Element>>(new Map());

  const ActionIconEls = {
    [ActionKeys.fullscreen]: <FullscreenAction key={ ActionKeys.fullscreen } variant={ ActionComponentVariant.button } />,
    [ActionKeys.jumpToPosition]: <JumpToPositionAction key={ ActionKeys.jumpToPosition } variant={ ActionComponentVariant.button } />,
    [ActionKeys.settings]: <SettingsAction key={ ActionKeys.settings } variant={ ActionComponentVariant.button } />,
    [ActionKeys.toc]: <TocAction key={ ActionKeys.toc } variant={ ActionComponentVariant.button } toc={ toc } />
  };
  
  const MenuItemEls = {
    [ActionKeys.fullscreen]: <FullscreenAction key={ ActionKeys.fullscreen } variant={ ActionComponentVariant.menu } />,
    [ActionKeys.jumpToPosition]: <JumpToPositionAction key={ ActionKeys.jumpToPosition } variant={ ActionComponentVariant.menu } />,
    [ActionKeys.settings]: <SettingsAction key={ ActionKeys.settings } variant={ ActionComponentVariant.menu } />,
    [ActionKeys.toc]: <TocAction key={ ActionKeys.toc } variant={ ActionComponentVariant.menu } toc={ toc } />
  };

  // Dispatch elements based on preferences
  const setup = useCallback(() => {
    if (target) {
      RSPrefs.actions.displayOrder.map((key) => {
        const actionPref = RSPrefs.actions[key];
        if (actionPref.visibility === ActionVisibility.overflow) {
          menuItemsMap.current.set(key, MenuItemEls[key]);
        } else if (actionPref.visibility === ActionVisibility.partially) {
          collapsibleKeys.current.push(key);
          actionIconsMap.current.set(key, ActionIconEls[key]);
        } else {
          actionIconsMap.current.set(key, ActionIconEls[key]);
        }
      });
    }
  }, [target]);

  const isOverflowing = useCallback(() => {
    if (target) {
      return target.scrollWidth > target.offsetWidth;
    } else {
      return false;
    }
  }, [target]);
  
  const triage = debounce((entries: ResizeObserverEntry[]) => {
    if (target && target.parentElement) {
      // Pausing while altering the target
      observer.current && observer.current.unobserve(target.parentElement);

      for (const entry of entries) {
        // Trying to protect against weird reports
        if (target.scrollWidth < target.offsetWidth) return;

        if (
          isOverflowing() && 
          collapsibleKeys.current.length > 0
        ) {
          // Pick the key of the action icon we can migrate from collapsible
          const key = collapsibleKeys.current[collapsibleKeys.current.length - 1];
          // Add to menu items and remove from action icons
          menuItemsMap.current.set(key, MenuItemEls[key]);
          actionIconsMap.current.delete(key);
          // Update collapsible/collapsed
          // Remove last item of collapsible
          collapsibleKeys.current.splice(collapsibleKeys.current.length - 1, 1);
          // We have to put the item first in collapsed so that it can be retrieved in the correct order
          collapsedKeys.current.unshift(key);
        } else if (
          !isOverflowing() && 
          collapsedKeys.current.length > 0 && 
          entry.contentRect.width > cachedParentWidth.current
        ) {
          // if dramatic change in width of the window/parentElement, 
          // it will only fire once, and not display all the action icons it can
          // because of the debounce…
          // throttling solve the issue, but creates another one the other way around… 
          // so we have to do a loop to make this recursive…
          while (
            !isOverflowing() && 
            collapsedKeys.current.length > 0
          ) {
            // Pick the key of the menu item we can migrate from collapsed
            const key = collapsedKeys.current[0];
            // Remove from menu items and add to action icons
            menuItemsMap.current.delete(key);
            actionIconsMap.current.set(key, ActionIconEls[key]);
            // Update collapsible/collapsed
            // Push in last position of collapsible
            collapsibleKeys.current.push(key);
            // Remove first item of collapsed as it was put at first position above
            collapsedKeys.current.shift();

            // Back to while condition
            continue;
          }
        }

        // Update cached width of parent element to filter false negatives of isOverflowing
        cachedParentWidth.current = entry.contentRect.width;

        setActionIcons([...actionIconsMap.current.values()]);
        // Array from map has to be reversed to keep prefs order since they are added from last collapsible
        setMenuItems([...menuItemsMap.current.values()].reverse());
      };

      // Resuming observer
      observer.current && observer.current.observe(target.parentElement);
    }
  }, 20);

  useLayoutEffect(() => {
    if (!target || !target.parentElement) return;
    
    setup();
    
    observer.current = new ResizeObserver(triage);
    // We can’t observe the target itself, as it will create an infinite loop
    // since adding and removing elements inside it will trigger a resize.
    observer.current.observe(target.parentElement);

    return () => {
      observer.current && observer.current.disconnect();
    }
  }, [target]);

  return {
    ActionIcons,
    MenuItems
  }
}