import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  View,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from "react-native";

type Props = {
  open: boolean;
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Collapsible({
  open,
  children,
  duration = 240,
  delay = 0,
  style,
}: Props) {
  const [contentHeight, setContentHeight] = useState(0);
  const [measured, setMeasured] = useState(false);

  const height = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== contentHeight) {
      setContentHeight(h);
      if (!measured) {
        height.setValue(open ? h : 0);
        opacity.setValue(open ? 1 : 0);
        setMeasured(true);
      }
    }
  };

  const animate = (toH: number, toOpacity: number, d = duration) => {
    Animated.parallel([
      Animated.timing(height, {
        toValue: toH,
        duration: d,
        delay,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: toOpacity,
        duration: d,
        delay,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!measured) return;
    animate(open ? contentHeight : 0, open ? 1 : 0);
  }, [open, measured, contentHeight]);

  useEffect(() => {
    if (measured && open && contentHeight > 0) {
      animate(contentHeight, 1, 160);
    }
  }, [contentHeight, measured, open]);

  if (!measured) {
    return (
      <View style={style} accessibilityState={{ expanded: open }}>
        {open ? (
          <View onLayout={onLayout}>{children}</View>
        ) : (
          <View onLayout={onLayout} />
        )}
      </View>
    );
  }

  return (
    <Animated.View
      style={[{ height, overflow: "hidden", opacity }, style]}
      accessibilityState={{ expanded: open }}
    >
      <View>{children}</View>
    </Animated.View>
  );
}
