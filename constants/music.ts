export const MAJOR_KEYS = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "Gb",
  "Db",
  "Ab",
  "Eb",
  "Bb",
  "F"
] as const;

export type DegreeFunction = "Tonic" | "Subdominant" | "Dominant";

export type DegreeInfo = {
  degree: string;
  label: string;
  functionName: DegreeFunction;
  shortDescription: string;
  roman: string;
};

export const MAJOR_DEGREES: DegreeInfo[] = [
  {
    degree: "I",
    label: "Tonic",
    functionName: "Tonic",
    shortDescription: "Home base and point of rest.",
    roman: "I",
  },
  {
    degree: "ii",
    label: "Supertonic",
    functionName: "Subdominant",
    shortDescription: "Prepares motion away from tonic.",
    roman: "ii",
  },
  {
    degree: "iii",
    label: "Mediant",
    functionName: "Tonic",
    shortDescription: "Soft color that supports tonic.",
    roman: "iii",
  },
  {
    degree: "IV",
    label: "Subdominant",
    functionName: "Subdominant",
    shortDescription: "Expands tension before resolution.",
    roman: "IV",
  },
  {
    degree: "V",
    label: "Dominant",
    functionName: "Dominant",
    shortDescription: "Tension that resolves to tonic.",
    roman: "V7",
  },
  {
    degree: "vi",
    label: "Submediant",
    functionName: "Tonic",
    shortDescription: "Gentle contrast to tonic.",
    roman: "vi",
  },
  {
    degree: "viiº",
    label: "Leading Tone",
    functionName: "Dominant",
    shortDescription: "Pulls upward toward tonic.",
    roman: "vii°",
  },
];

export const FUNCTION_COLORS: Record<DegreeFunction, string> = {
  Tonic: "bg-tonic",
  Subdominant: "bg-subdominant",
  Dominant: "bg-dominant",
};
