import { memo } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { Grip } from "lucide-react-native";
import { DegreeCard } from "../hooks/useRandomDegrees";
import { FUNCTION_COLORS } from "../constants/music";

type Props = { item: DegreeCard; isActive: boolean; index: number };

const DegreeCardComponent = ({ item, isActive, index }: Props) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).springify().mass(1).damping(18).stiffness(220)}
      layout={Layout.springify().mass(1.2).damping(18).stiffness(240)}
      className={`rounded-3xl px-5 py-4 mb-4 bg-card shadow-glow ${isActive ? "opacity-90" : "opacity-100"}`}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center">
            <View className={`h-2.5 w-2.5 rounded-full ${FUNCTION_COLORS[item.functionName]} mr-2`} />
            <Text className="text-white text-base font-semibold">{item.degree} • {item.chordName}</Text>
          </View>
          <Text className="text-zinc-400 text-xs mt-1">{item.functionName} • {item.label}</Text>
        </View>
        <Grip color="#6b7280" size={18} />
      </View>
      <Text className="text-zinc-300 text-sm mt-3">{item.shortDescription}</Text>
    </Animated.View>
  );
};

export const DegreeCardView = memo(DegreeCardComponent);
