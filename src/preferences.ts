import { ShortcutRepresentation } from "./components/Shortcut";
import { ActionKeys, ActionVisibility } from "./components/Templates/ActionComponent";
import { ShortcutMetaKeywords } from "./helpers/keyboard/getMetaKeys";
import { ScrollAffordancePref, ScrollBackTo } from "./helpers/scrollAffordance";

export const RSPrefs = {
  typography: {
    minimalLineLength: 35, // undefined | null | number of characters. If 2 cols will switch to 1 based on this
    optimalLineLength: 75, // number of characters. If auto layout, picks colCount based on this
    pageGutter: 20 // body padding in px
  },
  scroll: {
    topAffordance: ScrollAffordancePref.none,
    bottomAffordance: ScrollAffordancePref.both,
    backTo: ScrollBackTo.top
  },
  theming: {
    arrow: {
      size: 40, // Size of the left and right arrows in px
      offset: 5 // offset of the arrows from the edges in px
    },
    color: {
      primary: "#4d4d4d",
      secondary: "white",
      disabled: "#767676",
      subdued: "#999999",
      hover: "#eaeaea",
      selected: "#eaeaea"
    },
    icon: {
      size: 24, // Size of icons in px
      tooltipOffset: 15 // offset of tooltip in px
    }
  },
  shortcuts: {
    representation: ShortcutRepresentation.symbol,
    joiner: " + "
  },
  actions: {
    displayOrder: [
      ActionKeys.settings,
      ActionKeys.fullscreen,
      ActionKeys.toc,
      ActionKeys.jumpToPosition
    ],
    [ActionKeys.settings]: {
      visibility: ActionVisibility.partially,
      shortcut: `${ShortcutMetaKeywords.platform}+P`
    },
    [ActionKeys.fullscreen]: {
      visibility: ActionVisibility.partially,
      shortcut: `${ShortcutMetaKeywords.platform}+F11`
    },
    [ActionKeys.toc]: {
      visibility: ActionVisibility.partially,
      shortcut: `${ShortcutMetaKeywords.platform}+N`
    },
    [ActionKeys.jumpToPosition]: {
      visibility: ActionVisibility.overflow,
      shortcut: `${ShortcutMetaKeywords.platform}+J`
    }
  }
}