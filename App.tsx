import "react-native-gesture-handler";
import "./global.css";

import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import * as Haptics from "expo-haptics";
import { Dice5, RefreshCcw } from "lucide-react-native";
import { Progression, Scale } from "@tonaljs/tonal";

import { MAJOR_DEGREES, MAJOR_KEYS } from "./constants/music";
import { DegreeCard, useRandomDegrees } from "./hooks/useRandomDegrees";
import { DegreeCardView } from "./components/DegreeCard";

const degreeCounts = [3, 4, 5, 6];

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

export default function App() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [degreeCount, setDegreeCount] = useState<number | null>(null);
  const [cards, setCards] = useState<DegreeCard[]>([]);
  const randomizeDegrees = useRandomDegrees();

  const flip = useSharedValue(0);

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
    if (!degreeCount) {
      return;
    }
    setCards(randomizeDegrees(keyDegrees, degreeCount));
  };

  const pickKey = () => {
    const nextKey = MAJOR_KEYS[Math.floor(Math.random() * MAJOR_KEYS.length)];
    flip.value = withSequence(withTiming(180, { duration: 420 }), withTiming(0, { duration: 280 }));
    setSelectedKey(nextKey);
  };

  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flip.value}deg` }],
  }));

  const renderItem = ({ item, drag, isActive }: RenderItemParams<DegreeCard>) => {
    return (
      <ScaleDecorator>
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          className="active:opacity-90"
        >
          <DegreeCardView item={item} isActive={isActive} />
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-ink px-5">
      <StatusBar style="light" />
      <View className="flex-row items-center justify-between mt-2 mb-6">
        <View>
          <Text className="text-zinc-400 text-xs uppercase tracking-widest">Harmony Sort</Text>
          <Text className="text-white text-2xl font-semibold">Degree Drift</Text>
        </View>
        <Pressable
          onPress={resetKey}
          className="bg-zinc-900 rounded-full px-3 py-2"
        >
          <Text className="text-zinc-300 text-xs">Reset</Text>
        </Pressable>
      </View>

      {!selectedKey && (
        <Animated.View entering={FadeIn.duration(400)} className="flex-1 items-center justify-center">
          <Animated.View style={flipStyle} className="w-full">
            <Pressable
              onPress={pickKey}
              className="bg-card rounded-3xl p-8 items-center shadow-glow"
            >
              <Dice5 color="#4f8cff" size={28} />
              <Text className="text-white text-lg font-semibold mt-4">Pick a Key</Text>
              <Text className="text-zinc-400 text-sm mt-2">Tap to draw a random major key</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}

      {selectedKey && !degreeCount && (
        <Animated.View entering={FadeIn.duration(400)} className="flex-1">
          <View className="bg-card rounded-3xl p-6 shadow-glow">
            <Text className="text-zinc-400 text-xs uppercase tracking-widest">Selected Key</Text>
            <Text className="text-white text-3xl font-semibold mt-2">{selectedKey} Major</Text>
            <Text className="text-zinc-400 text-sm mt-3">Choose how many degrees to sort.</Text>
            <View className="flex-row flex-wrap mt-5">
              {degreeCounts.map((count) => (
                <Pressable
                  key={count}
                  onPress={() => startGame(count)}
                  className="bg-zinc-900 rounded-2xl px-4 py-3 mr-3 mb-3"
                >
                  <Text className="text-white text-base font-semibold">{count} cards</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      {selectedKey && degreeCount && (
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-zinc-400 text-xs uppercase tracking-widest">Now Sorting</Text>
              <Text className="text-white text-xl font-semibold">{selectedKey} Major • {degreeCount} Degrees</Text>
            </View>
            <Pressable onPress={redraw} className="bg-zinc-900 rounded-full p-3">
              <RefreshCcw color="#a1a1aa" size={18} />
            </Pressable>
          </View>
          <DraggableFlatList
            data={cards}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onDragEnd={({ data }) => setCards(data)}
            onDragBegin={() => {
              void Haptics.selectionAsync();
            }}
            onPlaceholderIndexChange={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activationDistance={10}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
