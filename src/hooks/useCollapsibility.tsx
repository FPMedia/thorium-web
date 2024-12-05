import React, { useCallback, useEffect, useRef, useState } from "react";

import { RSPrefs } from "@/preferences";

import { Links } from "@readium/shared";

import { FullscreenAction } from "@/components/FullscreenAction";
import { JumpToPositionAction } from "@/components/JumpToPositionAction";
import { SettingsAction } from "@/components/SettingsAction";
import { TocAction } from "@/components/TocAction";
import { ActionComponentVariant, ActionKeys, ActionVisibility } from "@/components/Templates/ActionComponent";

export const useCollapsibility = <T extends HTMLElement>(target: T | null, toc: Links) => {
  const resizingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  
  const triage = useCallback(() => {
    if (target) {
      resizingTimer.current && clearTimeout(resizingTimer.current);
      resizingTimer.current = setTimeout(() => {
        if (isOverflowing() && collapsibleKeys.current.length > 0) {
          const key = collapsibleKeys.current[collapsibleKeys.current.length - 1];
          menuItemsMap.current.set(key, MenuItemEls[key]);
          actionIconsMap.current.delete(key);
          collapsibleKeys.current.splice(collapsibleKeys.current.length - 1, 1);
          collapsedKeys.current.unshift(key);
        } else if (!isOverflowing() && collapsedKeys.current.length > 0) {
          const k = collapsedKeys.current[0];
          const el = ActionIconEls[k];
          menuItemsMap.current.delete(k);
          actionIconsMap.current.set(k, el);
          collapsibleKeys.current.push(k);
          collapsedKeys.current.shift();
        }

        setActionIcons([...actionIconsMap.current.values()]);
        setMenuItems([...menuItemsMap.current.values()].reverse());
      }, 20);
    }
  }, [target]);

  useEffect(() => {
    if (!target || !target.parentElement) return;
    
    setup();
    
    const observer = new ResizeObserver(triage);
    observer.observe(target.parentElement);

    return () => {
      observer.disconnect();
    }
  }, [target]);

  return {
    ActionIcons,
    MenuItems
  }
}