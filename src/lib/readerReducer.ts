import { createSlice } from "@reduxjs/toolkit";

import { defaultPlatformModifier, UnstablePlatformModifier } from "@/core/Helpers/keyboardUtilities";
import { ThSettingsContainerKeys, ThLayoutDirection } from "@/preferences/models/enums";

export type LoadingPhase = 
  | "fetching-manifest"
  | "initializing-publication"
  | "fetching-positions"
  | "initializing-navigator"
  | "ready";

export interface ReaderReducerState {
  profile: "epub" | "webPub" | undefined;
  direction: ThLayoutDirection;
  isLoading: boolean;
  loadingProgress: number; // 0-100
  loadingPhase: LoadingPhase;
  isImmersive: boolean;
  isHovering: boolean;
  hasScrollAffordance: boolean;
  hasArrows: boolean;
  hasUserNavigated: boolean;
  isFullscreen: boolean;
  settingsContainer: ThSettingsContainerKeys;
  platformModifier: UnstablePlatformModifier;
}

const initialState: ReaderReducerState = {
  profile: undefined,
  direction: ThLayoutDirection.ltr,
  isLoading: true,
  loadingProgress: 0,
  loadingPhase: "fetching-manifest",
  isImmersive: false,
  isHovering: false,
  hasScrollAffordance: false,
  hasArrows: true,
  hasUserNavigated: false,
  isFullscreen: false,
  settingsContainer: ThSettingsContainerKeys.initial,
  platformModifier: defaultPlatformModifier
}

export const readerSlice = createSlice({
  name: "reader",
  initialState,
  reducers: {
    setReaderProfile: (state, action) => {
      state.profile = action.payload
    },
    setDirection: (state, action) => {
      state.direction = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
      if (!action.payload) {
        state.loadingProgress = 100;
        state.loadingPhase = "ready";
      }
    },
    setLoadingProgress: (state, action) => {
      state.loadingProgress = action.payload
    },
    setLoadingPhase: (state, action) => {
      state.loadingPhase = action.payload
      // Auto-update progress based on phase
      const phaseProgress: Record<LoadingPhase, number> = {
        "fetching-manifest": 10,
        "initializing-publication": 30,
        "fetching-positions": 60,
        "initializing-navigator": 85,
        "ready": 100
      };
      state.loadingProgress = phaseProgress[action.payload] || state.loadingProgress;
    },
    setPlatformModifier: (state, action) => {
      state.platformModifier = action.payload
    },
    setImmersive: (state, action) => {
      state.isImmersive = action.payload
      if (action.payload === true) {
        state.isHovering = false;
        state.hasScrollAffordance = false;
      }
    },
    toggleImmersive: (state) => {
      state.isImmersive = !state.isImmersive;
      if (state.isImmersive === true) {
        state.isHovering = false;
        state.hasScrollAffordance = false;
      }
    },
    setHovering: (state, action) => {
      state.isHovering = action.payload
    },
    setScrollAffordance: (state, action) => {
      state.hasScrollAffordance = action.payload
      if (action.payload === true) {
        state.isHovering = false;
        state.isImmersive = false;
      }
    },
    setHasArrows: (state, action) => {
      state.hasArrows = action.payload
    },
    setUserNavigated: (state, action) => {
      state.hasUserNavigated = action.payload;
    },
    setFullscreen: (state, action) => {
      state.isFullscreen = action.payload
    },
    setSettingsContainer: (state, action) => {
      state.settingsContainer = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { 
  setReaderProfile, 
  setDirection, 
  setLoading,
  setLoadingProgress,
  setLoadingPhase,
  setPlatformModifier, 
  setImmersive, 
  toggleImmersive, 
  setHovering,
  setScrollAffordance,
  setHasArrows,  
  setUserNavigated,
  setFullscreen,
  setSettingsContainer
} = readerSlice.actions;

export default readerSlice.reducer;