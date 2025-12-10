import { ReactNode } from "react";

import readerLoaderStyles from "./assets/styles/readerLoader.module.css";

import { ThLoader } from "@/core/Components/Reader/ThLoader";
import { BookLoadingScreen } from "./BookLoadingScreen";

import { useI18n } from "@/i18n/useI18n";
import { useAppSelector } from "@/lib/hooks";

export const StatefulLoader = ({ isLoading, children }: { isLoading: boolean, children: ReactNode }) => {
  const { t } = useI18n();
  const loadingProgress = useAppSelector(state => state.reader.loadingProgress);
  const loadingPhase = useAppSelector(state => state.reader.loadingPhase);

  return (
    <>
    <ThLoader 
      isLoading={ isLoading } 
      loader={ <BookLoadingScreen progress={ loadingProgress } phase={ loadingPhase } /> } 
      className={ readerLoaderStyles.readerLoaderWrapper } 
    >
      { children }
    </ThLoader>
    </>
  )
}