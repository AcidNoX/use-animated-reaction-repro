import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export function sortBy<T>(arr: Array<T>, predicate: (v: T) => any): Array<T> {
  "worklet";
  return [...arr].sort((a, b) => {
    const aVal = predicate(a);
    const bVal = predicate(b);
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  });
}

export const clamp = (
  value: number,
  lowerBound: number,
  upperBound: number
) => {
  "worklet";
  return Math.min(Math.max(lowerBound, value), upperBound);
};

export function last<T>(
  arr: Array<T>,
  predicate: (x: T) => boolean = () => true
): T {
  "worklet";
  const val = (arr || []).slice().reverse().find(predicate);
  if (!val) throw new Error("Array is null or empty");
  return val;
}

const tabs = [
  {
    name: "Skin",
  },
  {
    name: "Hair style",
  },
  {
    name: "Hair color",
  },
  {
    name: "Facial hair",
  },
  {
    name: "Coat",
  },
];

const styles = StyleSheet.create({
  tabsContainer: {
    marginTop: "50%",
    height: 48,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    zIndex: 2,
  },
  track: {
    flexDirection: "row",
  },
  tabItem: {
    paddingHorizontal: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
  },
});

const SCREEN_WIDTH = Dimensions.get("window").width;

type TabsProps = {};

export const Tabs: React.FC<TabsProps> = ({}) => {
  const widths = useSharedValue<Array<{ index: number; width: number }>>([]);
  const translateX = useSharedValue(0);

  const scrollToIndex = (index: number) => {
    "worklet";

    const items = sortBy(widths.value, (x) => x.index).filter(
      (x) => x.index <= index
    );
    const item = last(items);
    const offset =
      items.reduce((acc, curr) => acc + curr.width, 0) - item.width / 2;
    translateX.value = SCREEN_WIDTH * 0.5 - offset;
  };

  useAnimatedReaction(
    () => {
      return widths.value;
    },
    (res) => {
      console.log("REACTING", res);
      if ((res || []).length < 1) return;

      scrollToIndex(0);
    }
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.tabsContainer}>
      <Animated.View style={[styles.track, animatedStyle]}>
        {tabs.map((tab, index) => (
          <Animated.View
            key={tab.name}
            style={styles.tabItem}
            onLayout={(e) => {
              console.log("ON LAYOUT", widths.value.length);
              widths.value.push({ index, width: e.nativeEvent.layout.width });
            }}
          >
            <Text style={styles.text}>{tab.name}</Text>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
};
