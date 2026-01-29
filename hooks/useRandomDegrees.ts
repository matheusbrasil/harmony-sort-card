import { useCallback } from "react";
import { DegreeInfo } from "../constants/music";

export type DegreeCard = DegreeInfo & {
  id: string;
  chordName: string;
  displayDegree?: string;
  qualityLabel?: string;
};

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

export const useRandomDegrees = () => {
  return useCallback((degrees: DegreeCard[], count: number) => {
    if (count >= degrees.length) {
      return shuffle(degrees);
    }
    return shuffle(degrees).slice(0, count);
  }, []);
};
