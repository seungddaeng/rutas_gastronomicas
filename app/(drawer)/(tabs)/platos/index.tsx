import { FlatList, Text, View, ActivityIndicator } from "react-native";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { spacing } from "../../../../theme/tokens";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import SearchBar from "../../../../components/SearchBar";
import ZonaFilter from "../../../../components/ZonaFilter";
import DishCard from "../../../../components/DishCard";
import { useCatalogStore } from "../../../../store/catalog";
import PicosidadRange from "../../../../components/PicosidadRange";
import { zonasIds, type ZonaId } from "../../../../data/zonas";
import { fetchPlatosPage } from "../../../../services/platos";
import type { DocumentSnapshot } from "firebase/firestore";
import FadeView from "../../../../components/FadeView";
import { useFade } from "../../../../hooks/useFade";

const ZONAS = ["Todos", ...zonasIds] as const;

export default function PlatosList() {
  const { colors } = useThemeColors();

  const params = useLocalSearchParams<{ q?: string }>();
  const [queryText, setQueryText] = useState(params?.q ?? "");
  const [zona, setZona] = useState<(typeof ZONAS)[number]>("Todos");
  const [picRange, setPicRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 5,
  });

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const platos = useCatalogStore((s) => s.platos);
  const setPlatos = useCatalogStore((s) => s.setPlatos);

  const [focusTick, setFocusTick] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFocusTick((t) => t + 1);
    }, [])
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { items, last } = await fetchPlatosPage();
        if (!mounted) return;
        setPlatos(items);
        lastDocRef.current = last ?? null;
        setHasMore(Boolean(last));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [setPlatos]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { items, last } = await fetchPlatosPage({
        after: lastDocRef.current ?? undefined,
      });
      setPlatos([...platos, ...items]);
      lastDocRef.current = last ?? null;
      setHasMore(Boolean(last));
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, platos, setPlatos]);

  const filtrados = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return platos.filter((p) => {
      if (zona !== "Todos" && p.zona !== (zona as ZonaId)) return false;
      if (p.picosidad < picRange.min || p.picosidad > picRange.max)
        return false;
      if (q && !p.nombre.toLowerCase().startsWith(q)) return false;
      return true;
    });
  }, [platos, zona, picRange, queryText]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  const AnimatedDishCard = ({
    item,
    index,
    tick,
  }: {
    item: any;
    index: number;
    tick: number;
  }) => {
    const { opacity, transform, fadeIn } = useFade({
      direction: "up",
      distance: 16,
      initialOpacity: 0,
    });

    useEffect(() => {
      fadeIn({ delay: index * 40, duration: 300 });
    }, [index, tick]);

    return (
      <FadeView opacity={opacity} transform={transform} style={{}}>
        <DishCard item={item} />
      </FadeView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <SearchBar value={queryText} onChange={setQueryText} />
        <Text style={{ color: colors.muted, marginTop: 4 }}>Zonas</Text>
        <ZonaFilter zonas={[...ZONAS]} value={zona} onChange={setZona} />
        <PicosidadRange value={picRange} onChange={setPicRange} />
      </View>

      <FlatList
        key={`platos-${focusTick}`}
        extraData={focusTick}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
        }}
        data={filtrados}
        keyExtractor={(it) => it.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item, index }) => (
          <AnimatedDishCard item={item} index={index} tick={focusTick} />
        )}
        onEndReachedThreshold={0.6}
        onEndReached={() => loadMore()}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: spacing.md }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  );
}
