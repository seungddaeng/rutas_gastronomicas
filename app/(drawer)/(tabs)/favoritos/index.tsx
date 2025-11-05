import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { spacing, radius } from "../../../../theme/tokens";
import { useCatalogStore, type Plato } from "../../../../store/catalog";
import DishCard from "../../../../components/DishCard";
import { fetchPlatoById } from "../../../../services/platos";

export default function FavoritosTab() {
  const { colors } = useThemeColors();
  const platos = useCatalogStore((s) => s.platos);
  const setPlatos = useCatalogStore((s) => s.setPlatos);
  const favoritos = useCatalogStore((s) => s.favoritos);

  const favIds = useMemo(() => Array.from(favoritos), [favoritos]);

  const [loadingFavs, setLoadingFavs] = useState(false);
  const requestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (favIds.length === 0) return;

    const existentes = new Set(platos.map((p) => p.id));
    const missing = favIds.filter(
      (id) => !existentes.has(id) && !requestedRef.current.has(id)
    );
    if (missing.length === 0) return;

    setLoadingFavs(true);
    missing.forEach((id) => requestedRef.current.add(id));

    (async () => {
      try {
        const fetched: Plato[] = [];
        for (const id of missing) {
          try {
            const p = await fetchPlatoById(id);
            if (p) fetched.push(p as Plato);
          } catch {}
        }
        if (fetched.length) {
          const byId = new Map<string, Plato>();
          for (const p of platos) byId.set(p.id, p);
          for (const p of fetched) byId.set(p.id, p);
          setPlatos(Array.from(byId.values()));
        }
      } finally {
        setLoadingFavs(false);
      }
    })();
  }, [favIds, platos, setPlatos]);

  const favoritosList = useMemo(() => {
    if (favIds.length === 0) return [];
    const favSet = new Set(favIds);
    return platos.filter((p) => favSet.has(p.id));
  }, [favIds, platos]);

  if (favIds.length === 0) {
    return (
      <View style={[styles.wrap, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 48,
              textAlign: "center",
              marginBottom: spacing.md,
              color: colors.primary,
            }}
          >
            ♥
          </Text>
          <Text style={[styles.msg, { color: colors.text }]}>
            ¡Aquí verás tus platos favoritos!
          </Text>
          <Text
            style={{ textAlign: "center", color: colors.muted, marginTop: 6 }}
          >
            Toca el corazón en un plato para guardarlo.
          </Text>
        </View>
      </View>
    );
  }

  if (loadingFavs && favoritosList.length === 0) {
    return (
      <View
        style={[
          styles.wrap,
          {
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
      }}
    >
      <FlatList
        contentContainerStyle={{ paddingVertical: spacing.lg }}
        data={favoritosList}
        keyExtractor={(it) => it.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => <DishCard item={item} />}
        ListEmptyComponent={
          !loadingFavs ? (
            <View style={{ padding: spacing.lg }}>
              <Text style={{ color: colors.muted }}>
                No se encontraron platos para tus favoritos.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.lg },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8,
  },
  msg: { textAlign: "center", fontWeight: "700" },
});
