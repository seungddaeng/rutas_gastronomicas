import { useRef } from "react";
import { Animated, Easing } from "react-native";

type Direction = "up" | "down" | "left" | "right";

type TranslateTransform = Array<
  { translateY: Animated.Value } | { translateX: Animated.Value }
>;

const getInitialOffset = (direction: Direction, distance: number) => {
  switch (direction) {
    case "up":
      return distance;
    case "down":
      return -distance;
    case "left":
      return distance;
    case "right":
      return -distance;
  }
};

export const useFade = ({
  direction = "up",
  distance = 16,
  initialOpacity = 0,
}: {
  direction?: Direction;
  distance?: number;
  initialOpacity?: number;
} = {}) => {
  const opacity = useRef(new Animated.Value(initialOpacity)).current;
  const translate = useRef(
    new Animated.Value(getInitialOffset(direction, distance))
  ).current;

  const run = (
    toValue: number,
    opts?: { duration?: number; delay?: number }
  ) => {
    const { duration = 320, delay = 0 } = opts || {};
    const easing = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue,
        duration,
        delay,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: toValue === 0 ? getInitialOffset(direction, distance) : 0,
        duration,
        delay,
        easing,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const transform: TranslateTransform =
    direction === "up" || direction === "down"
      ? [{ translateY: translate }]
      : [{ translateX: translate }];

  const fadeIn = (o?: { duration?: number; delay?: number }) => run(1, o);
  const fadeOut = (o?: { duration?: number; delay?: number }) => run(0, o);

  return { opacity, transform, fadeIn, fadeOut };
};
