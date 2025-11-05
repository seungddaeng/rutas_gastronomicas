import React, { useMemo, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, ViewToken, Image, TouchableOpacity } from "react-native";
import type { Dish } from "./DishCard";
import { useThemeColors } from "../hooks/useThemeColors";
import { useCurrency } from "../hooks/useCurrency";
import { Link } from "expo-router";
import { spacing, radius } from "../theme/tokens";
import { useSuggestionsStore } from "../store/suggestions";
import { explainReason } from "../utils/similarity";

type Props = {
  allPlatos: Dish[];
  favoriteIds: string[];
  getDishNameById: (id: string) => string;
};

export const SugerenciasCarousel: React.FC<Props> = ({ allPlatos, favoriteIds, getDishNameById }) => {
  const { colors } = useThemeColors();
  const { format } = useCurrency();
  const { items, loading, reasonById, refresh } = useSuggestionsStore();
  const [currentVisibleId, setCurrentVisibleId] = useState<string | null>(null);

  // detecrtar cambios con favoritos
  const favKey = React.useMemo(
    () => (favoriteIds?.length ? [...favoriteIds].sort().join("|") : ""),
    [favoriteIds]
  );

  React.useEffect(() => {
    refresh({ allPlatos, favoriteIds, limit: 12 });
  }, [favKey, allPlatos.length, refresh]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    const first = viewableItems?.[0]?.item as Dish | undefined;
    setCurrentVisibleId(first?.id ?? null);
  });

  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 60 }), []);

  const empty = !loading && favoriteIds.length === 0;
  const showList = !empty && items.length > 0;

  const becauseText = useMemo(() => {
    if (!currentVisibleId) return null;
    const reason = reasonById[currentVisibleId];
    if (!reason) return null;
    const refName = getDishNameById(reason.refDishId) || "ese platillo";
    return explainReason(reason.cause as any, refName);
  }, [currentVisibleId, reasonById, getDishNameById]);

  return (
    <View style={{ marginTop: 8, marginBottom: 16 }}>
      <Text style={[styles.title, { color: colors.text }]}>Sugerencias para ti 🧡</Text>

      {empty && (
        <View style={[styles.emptyBox, { borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>¡Preparando sugerencias para ti!</Text>
        </View>
      )}

      {showList && (
        <>
          <FlatList
            horizontal
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Link href={`/(drawer)/(tabs)/platos/${item.id}`} asChild>
                <TouchableOpacity>
                  <View
                    style={[
                      styles.miniCard,
                      { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow },
                    ]}
                  >
                    <Image source={item.picUri} style={styles.miniImage} />
                    <Text numberOfLines={1} style={[styles.miniName, { color: colors.text }]}>{item.nombre}</Text>
                    <Text style={[styles.miniPrice, { color: colors.muted }]}>{format(item.precioReferencial)}</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
            ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig}
          />
          {!!becauseText && (
            <Text style={[styles.becauseText, { color: colors.muted }]}>{becauseText}</Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: { 
    fontSize: 18, 
    fontWeight: "900", 
    paddingHorizontal: spacing.lg, 
    marginBottom: 4 
},
  emptyBox: {
    height: 140,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    opacity: 0.7,
},
  emptyText: { 
    fontSize: 14 
},
  miniCard: { 
    width: 140, 
    padding: 12, 
    borderRadius: radius.lg, 
    borderWidth: 1, 
    elevation: 2 
},
  miniImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 999, 
    alignSelf: "center", 
    marginBottom: 8, 
    backgroundColor: "#eee" 
},
  miniName: { 
    fontSize: 14, 
    fontWeight: "800", 
    textAlign: "center" 
},
  miniPrice: { 
    fontSize: 12, 
    textAlign: "center", 
    marginTop: 2 
},
  becauseText: { 
    marginTop: 6, 
    paddingHorizontal: spacing.lg, 
    fontSize: 13 
},
});
