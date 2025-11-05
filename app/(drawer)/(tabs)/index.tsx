import React from "react";
import { Image, Text, View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useCurrency } from "../../../hooks/useCurrency";
import { useDailyDishes } from "../../../hooks/useDailyDishes";
import { useCatalogStore } from "../../../store/catalog";
import { platos as data } from "../../../data/platos";
import { spacing, radius } from "../../../theme/tokens";
import type { Dish } from "../../../components/DishCard";
import { SugerenciasCarousel } from "../../../components/SugerenciasCarousel";
import { applyCloudinaryToPlatos } from "../../../utils/applyCloudinaryToPlatos";

export default function Home() {
  const { colors } = useThemeColors();
  const { format } = useCurrency();

  const platosStore = useCatalogStore((s) => s.platos);
  const all: Dish[] = applyCloudinaryToPlatos(platosStore.length ? platosStore : (data as Dish[]));
  const delDia = useDailyDishes(all, 10);

  const favRaw = useCatalogStore((s) => (s as any).favoritosIds ?? (s as any).favoritos);
  const favoritosIds = React.useMemo(() => {
    if (Array.isArray(favRaw)) return favRaw as string[];
    if (favRaw instanceof Set) return Array.from(favRaw as Set<string>);
    return [] as string[];
  }, [favRaw]);

  const getDishNameById = (id: string) => (all.find(x => x.id === id)?.nombre ?? "");

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerWrap}>
        <Text style={[styles.h1, { color: colors.text }]}>SABORES PACEÑOS</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>¡Bienvenido a tu guía de sabores!</Text>
      </View>

      <Image
        source={{ uri: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1" }}
        style={[styles.hero, { shadowColor: colors.shadow }]}
      />

      <View style={styles.actionsColumn}>
        <Link href="/(drawer)/(tabs)/platos" asChild>
          <TouchableOpacity activeOpacity={0.85}>
            <View style={[styles.btnFilled, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              <Text style={styles.btnFilledText}>Explorar Platos</Text>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/(drawer)/(tabs)/favoritos" asChild>
          <TouchableOpacity activeOpacity={0.85}>
            <View style={[styles.btnOutline, { borderColor: colors.primary, backgroundColor: colors.background }]}>
              <Text style={[styles.btnOutlineText, { color: colors.primary }]}>Ver Favoritos</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Platos del Día</Text>
        <Link href="/(drawer)/(tabs)/platos" asChild>
          <TouchableOpacity>
            <Text style={[styles.sectionSeeAll, { color: colors.primary }]}>Ver todo ›</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <FlatList
        style={styles.carousel}
        data={delDia}
        keyExtractor={(it) => it.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
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
      />
      <SugerenciasCarousel
        allPlatos={all}
        favoriteIds={favoritosIds}
        getDishNameById={getDishNameById}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },

  headerWrap: { 
    paddingHorizontal: spacing.lg, 
    marginTop: spacing.lg, 
    alignItems: "center" 
  },
  h1: { 
    fontSize: 28, 
    fontWeight: "800", 
    letterSpacing: 0.3, 
    textAlign: "center", 
    marginBottom: spacing.xs 
  },
  sub: { 
    fontSize: 16, 
    textAlign: "center" 
  },
  hero: {
    width: "92%",
    height: 190,
    alignSelf: "center",
    marginTop: spacing.md,
    borderRadius: radius.xl,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    backgroundColor: "#ddd",
  },

  actionsColumn: { width: "92%", alignSelf: "center", marginTop: 16 },
  btnFilled: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  btnFilledText: { fontWeight: "800", fontSize: 16, color: "#fff" },
  btnOutline: {
    minHeight: 50,
    paddingHorizontal: 10,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    elevation: 1,
  },
  btnOutlineText: { fontWeight: "800", fontSize: 16 },

  sectionHeader: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "900" 
  },
  sectionSeeAll: { 
    fontSize: 14, 
    fontWeight: "700" 
  },
  carousel: { 
    marginTop: spacing.md 
  },
  listContent: { 
    paddingHorizontal: spacing.lg, 
    paddingBottom: spacing.md 
  },
  listSeparator: { 
    width: spacing.md 
  },
  miniCard: { 
    width: 140, 
    padding: 12, 
    borderRadius: radius.lg, 
    borderWidth: 1, 
    elevation: 2 },
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
});
