import React, { useRef } from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ImageSourcePropType,
  Animated,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useThemeColors";
import { useCurrency } from "../hooks/useCurrency";
import { spacing, radius } from "../theme/tokens";
import { useCatalogStore, type Plato } from "../store/catalog";
import { formatPicosidad } from "../utils/picosidad";
import { useReviewsStore } from "../store/reviews";
import { averageRating } from "../utils/rating";
import StarRating from "./StarRating";

export type Dish = Plato;

export default function DishCard({ item }: { item: Dish }) {
  const { colors } = useThemeColors();
  const { format } = useCurrency();
  const fav = useCatalogStore((s) => s.favoritos.has(item.id));
  const toggleFavorito = useCatalogStore((s) => s.toggleFavorito);

  const byDish = useReviewsStore((s) => s.byDish);
  const reviews = byDish[item.id]?.filter((r) => r.status === "approved") ?? [];
  const avg = averageRating(reviews.map((r) => r.rating));

  const scaleHeart = useRef(new Animated.Value(1)).current;
  const btnTint = useRef(new Animated.Value(0)).current;

  const lift = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleHeart, {
          toValue: 1.15,
          friction: 5,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.timing(btnTint, {
          toValue: 1,
          duration: 140,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scaleHeart, { toValue: 1, useNativeDriver: true }),
        Animated.timing(btnTint, {
          toValue: 0,
          duration: 180,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };

  const liftCard = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(lift, {
          toValue: 1,
          duration: 160,
          useNativeDriver: false,
        }),
        Animated.timing(lift, {
          toValue: 0,
          duration: 240,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.spring(cardScale, { toValue: 1.015, useNativeDriver: true }),
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const onToggleFav = () => {
    toggleFavorito(item.id);
    pulse();
    liftCard();
  };

  const HEART_RED = "#e11d48";
  const buttonBg = btnTint.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "rgba(225,17,71,0.10)"],
  });

  const elevation = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 12],
  });
  const shadowRadius = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 24],
  });
  const shadowOffsetH = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });
  const shadowOffsetV = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 8],
  });

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          borderColor: colors.border,
          shadowColor: colors.shadow,
          ...(Platform.OS === "ios"
            ? {
                shadowRadius,
                shadowOpacity: 1,
                shadowOffset: {
                  width: shadowOffsetH as unknown as number,
                  height: shadowOffsetV as unknown as number,
                },
              }
            : { elevation: elevation as unknown as number }),
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: cardScale }] }}>
        <View style={styles.cardInner}>
          <Link href={`/(drawer)/(tabs)/platos/${item.id}`} asChild>
            <Pressable
              style={{ flexDirection: "row", gap: spacing.md, flex: 1 }}
            >
              <Image
                source={item.picUri as ImageSourcePropType}
                style={styles.img}
                resizeMode="cover"
              />
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={[styles.title, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.nombre}
                </Text>

                <StarRating value={avg} />

                <Text style={{ color: colors.muted }}>
                  {formatPicosidad(item.picosidad)}
                </Text>
              </View>
            </Pressable>
          </Link>

          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text style={[styles.price, { color: colors.text }]}>
              {format(item.precioReferencial)}
            </Text>

            <Animated.View
              style={{
                backgroundColor: buttonBg,
                borderRadius: 999,
                padding: 4,
              }}
            >
              <Animated.View style={{ transform: [{ scale: scaleHeart }] }}>
                <TouchableOpacity
                  onPress={onToggleFav}
                  hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel={
                    fav ? "Quitar de favoritos" : "Agregar a favoritos"
                  }
                >
                  <Ionicons
                    name={fav ? "heart" : "heart-outline"}
                    size={18}
                    color={fav ? HEART_RED : colors.muted}
                  />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  cardInner: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  img: {
    width: 72,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: "#ddd",
  },
  title: { fontSize: 16, fontWeight: "700" },
  price: { fontSize: 14, fontWeight: "700" },
});
