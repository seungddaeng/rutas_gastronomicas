import { ReactNode } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";

type TranslateTransform = Array<
  { translateY: Animated.Value } | { translateX: Animated.Value }
>;

export default function FadeView({
  opacity,
  transform,
  children,
  style,
}: {
  opacity: Animated.Value;
  transform: TranslateTransform;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View style={[{ opacity }, { transform }, style]}>
      {children}
    </Animated.View>
  );
}
