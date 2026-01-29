import "react-native-gesture-handler";
import "./reanimated-polyfill";
import "react-native-reanimated";
import "./global.css";

import { useMemo, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import * as Haptics from "expo-haptics";
import { Dice5, RefreshCcw } from "lucide-react-native";
import { Progression, Scale } from "tonal";

import { MAJOR_DEGREES, MAJOR_KEYS } from "./constants/music";
import { DegreeCard, useRandomDegrees } from "./hooks/useRandomDegrees";
import { DegreeCardView } from "./components/DegreeCard";

const degreeCounts = [3, 4, 5, 6];

const moveItem = <T,>(list: T[], from: number, to: number) => {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

type Language = "en" | "pt";

const STRINGS: Record<Language, Record<string, string>> = {
  en: {
    appLabel: "HarmonCards",
    title: "HarmonCards",
    tagline: "Draw keys and degrees to practice music theory and create chord progressions.",
    reset: "Reset",
    selectedKey: "Selected Key",
    chooseCount: "Choose how many degrees to sort.",
    cardsLabel: "cards",
    pickKeyTitle: "Pick a Key",
    pickKeySubtitle: "Tap to draw a random major key",
    sortingTitle: "Now Sorting",
    degreesSuffix: "Degrees",
    major: "Major",
    language: "Language",
    redraw: "Redraw",
  },
  pt: {
    appLabel: "HarmonCards",
    title: "HarmonCards",
    tagline:
      "Sorteie tonalidades e graus para praticar teoria musical e montar progressões de acordes.",
    reset: "Reiniciar",
    selectedKey: "Tom escolhido",
    chooseCount: "Escolha quantos graus ordenar.",
    cardsLabel: "cartas",
    pickKeyTitle: "Sortear um tom",
    pickKeySubtitle: "Toque para sortear uma tonalidade maior aleatória",
    sortingTitle: "Ordenando",
    degreesSuffix: "Graus",
    major: "Maior",
    language: "Idioma",
    redraw: "Sortear novamente",
  },
};

const DEGREE_TEXT = {
  en: {
    functions: {
      Tonic: "Tonic",
      Subdominant: "Subdominant",
      Dominant: "Dominant",
    },
    labels: {
      I: "Tonic",
      ii: "Supertonic",
      iii: "Mediant",
      IV: "Subdominant",
      V: "Dominant",
      vi: "Submediant",
      "viiº": "Leading Tone",
    },
    descriptions: {
      I: "Home base and point of rest.",
      ii: "Prepares motion away from tonic.",
      iii: "Soft color that supports tonic.",
      IV: "Expands tension before resolution.",
      V: "Tension that resolves to tonic.",
      vi: "Gentle contrast to tonic.",
      "viiº": "Pulls upward toward tonic.",
    },
  },
  pt: {
    functions: {
      Tonic: "Tônica",
      Subdominant: "Subdominante",
      Dominant: "Dominante",
    },
    labels: {
      I: "Tônica",
      ii: "Supertônica",
      iii: "Mediante",
      IV: "Subdominante",
      V: "Dominante",
      vi: "Submediante",
      "viiº": "Sensível",
    },
    descriptions: {
      I: "Base e ponto de repouso.",
      ii: "Prepara o movimento para fora da tônica.",
      iii: "Cor suave que apoia a tônica.",
      IV: "Amplia a tensão antes da resolução.",
      V: "Tensão que resolve para a tônica.",
      vi: "Contraste suave à tônica.",
      "viiº": "Puxa para cima em direção à tônica.",
    },
  },
} as const;

const fallbackQuality = (degree: string) => {
  if (degree === "V") {
    return "7";
  }
  if (degree === "viiº") {
    return "dim";
  }
  if (degree === "ii" || degree === "iii" || degree === "vi") {
    return "m";
  }
  return "maj";
};

const buildChordName = (key: string, roman: string, fallback: string) => {
  const progression = Progression.fromRomanNumerals(key, [roman]);
  return progression[0] ?? fallback;
};

const safeHaptic = (callback: () => Promise<void>) => {
  // expo-haptics is unavailable on web; silently ignore in that case.
  if (Platform.OS === "web") return;
  void callback().catch(() => {});
};

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [degreeCount, setDegreeCount] = useState<number | null>(null);
  const [cards, setCards] = useState<DegreeCard[]>([]);
  const randomizeDegrees = useRandomDegrees();
  const activeIndexRef = useRef<number | null>(null);
  const placeholderIndexRef = useRef<number | null>(null);

  const flip = useSharedValue(0);
  const strings = STRINGS[language];

  const keyDegrees = useMemo(() => {
    if (!selectedKey) {
      return [];
    }
    const scaleNotes = Scale.get(`${selectedKey} major`).notes;
    return MAJOR_DEGREES.map((degree, index) => {
      const fallback = `${scaleNotes[index]}${fallbackQuality(degree.degree)}`;
      const chordName = buildChordName(selectedKey, degree.roman, fallback);
      return {
        ...degree,
        id: `${selectedKey}-${degree.degree}`,
        chordName,
      };
    });
  }, [selectedKey]);

  const startGame = (count: number) => {
    setDegreeCount(count);
    setCards(randomizeDegrees(keyDegrees, count));
  };

  const resetKey = () => {
    setSelectedKey(null);
    setDegreeCount(null);
    setCards([]);
  };

  const redraw = () => {
    if (degreeCount === null) {
      return;
    }
    setCards(randomizeDegrees(keyDegrees, degreeCount));
  };

  const pickKey = () => {
    const nextKey = MAJOR_KEYS[Math.floor(Math.random() * MAJOR_KEYS.length)];
    flip.value = withSequence(
      withTiming(180, { duration: 420 }),
      withSpring(0, { damping: 12, stiffness: 120, mass: 1.4 }),
    );
    setSelectedKey(nextKey);
  };

  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flip.value}deg` }],
  }));

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<DegreeCard>) => {
    const itemIndex = getIndex() ?? 0;
    const dragHandlers =
      Platform.OS === "web"
        ? { onPressIn: drag }
        : { onLongPress: drag };
    const functionLabel = DEGREE_TEXT[language].functions[item.functionName];
    const degreeLabel = DEGREE_TEXT[language].labels[item.degree as keyof typeof DEGREE_TEXT.en.labels];
    const description =
      DEGREE_TEXT[language].descriptions[item.degree as keyof typeof DEGREE_TEXT.en.descriptions];
    return (
      <ScaleDecorator>
        <Pressable
          {...dragHandlers}
          disabled={isActive}
          className="active:opacity-90"
        >
          <DegreeCardView
            item={item}
            isActive={isActive}
            index={itemIndex}
            text={{
              functionName: functionLabel,
              label: degreeLabel,
              description,
            }}
          />
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-ink px-5">
          <StatusBar style="light" />
          <View className="flex-row items-start justify-between mt-2 mb-6">
            <View className="flex-1 pr-3">
              <Text className="text-zinc-400 text-xs uppercase tracking-widest">{strings.appLabel}</Text>
              <Text className="text-white text-2xl font-semibold mt-1">{strings.title}</Text>
              <Text className="text-zinc-400 text-sm mt-2 leading-5">{strings.tagline}</Text>
            </View>
            <View className="items-end space-y-2">
              <Text className="text-zinc-500 text-[11px] uppercase tracking-widest">{strings.language}</Text>
              <View className="flex-row bg-zinc-900 rounded-full px-2 py-1">
                {(["en", "pt"] as Language[]).map((lang) => (
                  <Pressable
                    key={lang}
                    onPress={() => setLanguage(lang)}
                    className={`px-3 py-2 rounded-full ${language === lang ? "bg-card" : ""}`}
                  >
                    <Text className={`text-xs ${language === lang ? "text-white" : "text-zinc-400"}`}>
                      {lang === "en" ? "EN" : "PT-BR"}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={resetKey}
                className="bg-zinc-900 rounded-full px-3 py-2"
              >
                <Text className="text-zinc-300 text-xs">{strings.reset}</Text>
              </Pressable>
            </View>
          </View>

      {!selectedKey && (
        <Animated.View entering={FadeIn.duration(400)} className="flex-1 items-center justify-center">
          <Animated.View style={flipStyle} className="w-full">
            <Pressable
              onPress={pickKey}
              className="bg-card rounded-3xl p-8 items-center shadow-glow"
            >
              <Dice5 color="#4f8cff" size={28} />
              <Text className="text-white text-lg font-semibold mt-4">{strings.pickKeyTitle}</Text>
              <Text className="text-zinc-400 text-sm mt-2 text-center">{strings.pickKeySubtitle}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}

          {selectedKey && degreeCount === null && (
        <Animated.View entering={FadeIn.duration(400)} className="flex-1">
          <View className="bg-card rounded-3xl p-6 shadow-glow">
            <Text className="text-zinc-400 text-xs uppercase tracking-widest">{strings.selectedKey}</Text>
            <Text className="text-white text-3xl font-semibold mt-2">{selectedKey} {strings.major}</Text>
            <Text className="text-zinc-400 text-sm mt-3">{strings.chooseCount}</Text>
            <View className="flex-row flex-wrap mt-5">
              {degreeCounts.map((count) => (
                <Pressable
                  key={count}
                  onPress={() => startGame(count)}
                  className="bg-zinc-900 rounded-2xl px-4 py-3 mr-3 mb-3"
                >
                  <Text className="text-white text-base font-semibold">{count} {strings.cardsLabel}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>
          )}

          {selectedKey && degreeCount !== null && (
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-zinc-400 text-xs uppercase tracking-widest">{strings.sortingTitle}</Text>
              <Text className="text-white text-xl font-semibold">{selectedKey} {strings.major} • {degreeCount} {strings.degreesSuffix}</Text>
            </View>
            <Pressable onPress={redraw} className="bg-zinc-900 rounded-full p-3">
              <RefreshCcw color="#a1a1aa" size={18} />
            </Pressable>
          </View>
          <DraggableFlatList
            data={cards}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onDragBegin={(index) => {
              activeIndexRef.current = index;
              safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
            }}
            onDragEnd={({ data }) => {
              safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
              setCards(data);
              activeIndexRef.current = null;
              placeholderIndexRef.current = null;
            }}
            onPlaceholderIndexChange={(placeholderIndex) => {
              placeholderIndexRef.current = placeholderIndex;
              safeHaptic(() => Haptics.selectionAsync());
            }}
            onRelease={(index) => {
              activeIndexRef.current = activeIndexRef.current ?? index;
              const from = activeIndexRef.current;
              const to = placeholderIndexRef.current;
              if (from == null || to == null) return;
              setCards((prev) => moveItem(prev, from, to));
            }}
            activationDistance={10}
            dragHitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </View>
      )}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
