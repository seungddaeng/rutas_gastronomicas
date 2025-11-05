import { Link, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { spacing, radius } from "../../../../theme/tokens";
import { platos as data } from "../../../../data/platos";
import { useCatalogStore, type Plato } from "../../../../store/catalog";
import { useCurrency } from "../../../../hooks/useCurrency";
import { formatPicosidad } from "../../../../utils/picosidad";

import { useModerationStore } from "../../../../store/moderation";
import { ModerationBar } from "../../../../components/ModerationBar";

import { useReviewsStore } from "../../../../store/reviews";
import { averageRating } from "../../../../utils/rating";
import StarRating from "../../../../components/StarRating";
import ReviewsList from "../../../../components/ReviewsList";
import AddReviewForm from "../../../../components/AddReviewForm";
import { dishKeyFromName } from "../../../../utils/dishKey";
import { useEffect, useMemo, useState, useRef } from "react";
import { fetchPlatoById } from "../../../../services/platos";
import { useIsAdmin } from "../../../../constants/roles";
import FadeView from "../../../../components/FadeView";
import { useFade } from "../../../../hooks/useFade";
import * as Location from "expo-location";
import { zonasMap } from "../../../../data/zonas";
import { openInMaps, navigateInMaps } from "../../../../utils/nativeMaps";

export default function PlatoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeColors();
  const { format } = useCurrency("es-BO", "BOB", 2);

  const platos = useCatalogStore((s) => s.platos);
  const fav = useCatalogStore((s) => (id ? s.favoritos.has(id) : false));
  const toggleFavorito = useCatalogStore((s) => s.toggleFavorito);

  const [remote, setRemote] = useState<Plato | null>(null);
  const [loading, setLoading] = useState(false);

  const all: Plato[] = platos.length ? platos : data;

  const plato = useMemo(
    () => all.find((p) => p.id === id) ?? remote ?? null,
    [all, id, remote]
  );

  useEffect(() => {
    if (!id) return;
    if (plato) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const p = await fetchPlatoById(id);
        if (mounted) setRemote(p);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, plato]);

  if (!plato) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={{ color: colors.text }}>No encontrado</Text>
        )}
      </View>
    );
  }

  const dishKey = dishKeyFromName(plato.nombre);

  const statusMap = useModerationStore((s) => s.statusMap);
  const setStatus = useModerationStore((s) => s.setStatus);
  const status = statusMap[plato.id] ?? "approved";

  const byDish = useReviewsStore((s) => s.byDish);
  const reviews =
    byDish[plato.id]?.filter((r) => r.status === "approved") ?? [];
  const avg = averageRating(reviews.map((r) => r.rating));

  const imageSource =
    typeof plato.picUri === "string" ? { uri: plato.picUri } : plato.picUri;

  const isAdmin = useIsAdmin();

  const { opacity, transform, fadeIn } = useFade({
    direction: "up",
    distance: 16,
    initialOpacity: 0,
  });
  useEffect(() => {
    fadeIn({ duration: 300 });
  }, [fadeIn]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const heroScale = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1.02, 1],
    extrapolate: "clamp",
  });
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [-6, 0],
    extrapolate: "clamp",
  });

  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(
    null
  );
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const pos = await Location.getCurrentPositionAsync({});
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        // silencioso
      }
    })();
  }, []);

  const zona = zonasMap[plato.zona];

  return (
    <FadeView opacity={opacity} transform={transform} style={{ flex: 1 }}>
      <Animated.ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xl,
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View
          style={[
            styles.heroWrap,
            {
              borderRadius: radius.lg,
              backgroundColor: colors.surface,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Animated.Image
            source={imageSource}
            style={[
              styles.hero,
              {
                transform: [{ scale: heroScale }, { translateY: heroTranslateY }],
              },
            ]}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => toggleFavorito(plato.id)}
            style={[styles.favBtn, { backgroundColor: colors.background }]}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            accessibilityRole="button"
            accessibilityLabel={
              fav ? "Quitar de favoritos" : "Agregar a favoritos"
            }
          >
            <Ionicons
              name={fav ? "heart" : "heart-outline"}
              size={20}
              color={fav ? "#e11d48" : colors.muted}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.lg,
            padding: spacing.lg,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 18,
            elevation: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "800", color: colors.text }}
            >
              {plato.nombre}
            </Text>

            <TouchableOpacity
              onPress={() => toggleFavorito(plato.id)}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              accessibilityRole="button"
              accessibilityLabel={
                fav ? "Quitar de favoritos" : "Agregar a favoritos"
              }
            >
              <Ionicons
                name={fav ? "heart" : "heart-outline"}
                size={20}
                color={fav ? "#e11d48" : colors.muted}
              />
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.text, fontWeight: "700", marginTop: 4 }}>
            {format(plato.precioReferencial)}
          </Text>

          <View style={{ marginTop: spacing.xs }}>
            <StarRating value={avg} suffix="/5" />
          </View>

          <Text style={{ color: colors.muted, marginTop: spacing.xs }}>
            {formatPicosidad(plato.picosidad)}
          </Text>

          {isAdmin && (
            <ModerationBar
              value={status}
              onChange={(v) => setStatus(plato.id, v)}
            />
          )}

          <Text style={{ color: colors.text, marginTop: spacing.sm }}>
            {plato.descripcionCorta}
          </Text>

          <View style={{ marginTop: spacing.md }}>
            <Link
              href={{ pathname: "/(drawer)/(tabs)/mapa", params: { dishKey } }}
              asChild
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  alignSelf: "flex-start",
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
                accessibilityRole="button"
                accessibilityLabel="Ver en mapa"
              >
                <Ionicons name="map-outline" size={18} color={colors.text} />
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  Ver en mapa
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View
            style={{
              marginTop: spacing.lg,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: spacing.md,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
              Ubicación
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              Zona: {zona.nombre} — {zona.lugarTipico}
            </Text>

            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity
                onPress={() =>
                  openInMaps(
                    zona.centroid.latitude,
                    zona.centroid.longitude,
                    `${plato.nombre} - ${zona.nombre}`
                  )
                }
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderRadius: 10,
                  backgroundColor: colors.primary,
                  marginRight: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="navigate-outline" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Ver en mapa (nativo)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigateInMaps(
                    origin,
                    zona.centroid.latitude,
                    zona.centroid.longitude,
                    zona.lugarTipico
                  )
                }
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderRadius: 10,
                  backgroundColor: colors.primary,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="trail-sign-outline" size={18} color={colors.text} />
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  Trazar ruta
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <AddReviewForm platoId={plato.id} />
          <ReviewsList platoId={plato.id} />
        </View>
      </Animated.ScrollView>
    </FadeView>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  hero: {
    width: "100%",
    height: undefined,
    aspectRatio: 16 / 9,
  },
  favBtn: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    padding: spacing.sm,
    borderRadius: 999,
  },
});
