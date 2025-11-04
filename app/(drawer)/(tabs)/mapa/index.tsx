import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Platform, Pressable, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { zonas, zonasMap, type ZonaId } from "../../../../data/zonas";
import { useCatalogStore, type Plato } from "../../../../store/catalog";
import { useNearbyPlaces } from "../../../../hooks/useNearbyPlaces";
import MapFilters, { type PicoBand } from "../../../../components/MapFilters";
import { openInMaps } from "../../../../utils/nativeMaps";
import { platos as localPlatos } from "../../../../data/platos";

const INITIAL_REGION: Region = {
  latitude: -16.5,
  longitude: -68.15,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const DEFAULT_RADIUS_KM = 10;

type Mode = "zonas" | "platos" | "lugares";

export default function MapaTab() {
  const { colors } = useThemeColors();
  const { dishKey } = useLocalSearchParams<{ dishKey?: string }>();

  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const mapRef = useRef<MapView | null>(null);

  const [current, setCurrent] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocError("Permiso de ubicación denegado");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = pos.coords;
        setCurrent({ lat: latitude, lng: longitude });
        setRegion((r) => ({ ...r, latitude, longitude }));
      } catch (e: any) {
        setLocError(e?.message || "No se pudo obtener la ubicación");
      }
    })();
  }, []);

  const allPlatos = useCatalogStore((s) => s.platos);
  const [zonaSel, setZonaSel] = useState<ZonaId | "all">("all");
  const [picoSel, setPicoSel] = useState<PicoBand>("all");
  const [mode, setMode] = useState<Mode>(dishKey ? "lugares" : "platos");

  useEffect(() => { if (dishKey) setMode("lugares"); }, [dishKey]);

  const centerForQuery = useMemo(() => ({ lat: region.latitude, lng: region.longitude }), [region]);
  const { data: places = [], loading: loadingPlaces, error: errorPlaces } = useNearbyPlaces({
    center: dishKey ? centerForQuery : null,
    radiusKm: DEFAULT_RADIUS_KM,
    dishKey: dishKey || "",
  });

  const platosVisibles: Plato[] = useMemo(() => {
    const source = (allPlatos && allPlatos.length ? allPlatos : localPlatos) as Plato[];

    const zoneFiltered = zonaSel === "all" ? source : source.filter((p) => p.zona === zonaSel);

    const picoFiltered = zoneFiltered.filter((p) => {
      if (picoSel === "all") return true;
      if (picoSel === "suave") return p.picosidad >= 1 && p.picosidad <= 2;
      if (picoSel === "medio") return p.picosidad === 3;
      return p.picosidad >= 4;
    });

    return picoFiltered;
  }, [allPlatos, zonaSel, picoSel]);

  function scatterCoord(
  lat: number,
  lng: number,
  count: number,
  index: number
) {
  if (count === 1) return { latitude: lat, longitude: lng };
  const base = 0.0009;
  const rings = Math.ceil(Math.sqrt(count));
  const ring = Math.floor(index / rings) + 1;
  const angle = (2 * Math.PI * (index % rings)) / rings;
  const r = base * ring * 0.6;
  return {
    latitude: lat + r * Math.cos(angle),
    longitude: lng + r * Math.sin(angle),
  };
}

const platosPorZona = useMemo(() => {
  const map: Record<string, Plato[]> = {};
  for (const p of platosVisibles) {
    (map[p.zona] ??= []).push(p);
  }
  return map;
}, [platosVisibles]);

  const OverlayCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        top: Platform.OS === "android" ? 12 : 44,
        zIndex: 10,
        elevation: 10,
      }}
    >
      <View
        pointerEvents="auto"
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          shadowColor: colors.shadow,
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 16,
        }}
      >
        {children}
      </View>
    </View>
  );

  const ModeChip = ({
    active,
    label,
    onPress,
  }: {
    active: boolean;
    label: string;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: active ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        marginRight: 8,
      }}
    >
      <Text style={{ color: active ? "#fff" : colors.subtitle, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MapView
        ref={mapRef}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
        toolbarEnabled
        loadingEnabled
      >
        {mode === "zonas" &&
          zonas.map((z) => (
            <Marker
              key={`zona-${z.id}`}
              coordinate={{ latitude: z.centroid.latitude, longitude: z.centroid.longitude }}
              title={`Zona: ${z.nombre}`}
              description={z.lugarTipico}
              pinColor="#3366FF"
            >
              <Callout onPress={() => openInMaps(z.centroid.latitude, z.centroid.longitude, z.lugarTipico)}>
                <View style={{ maxWidth: 220 }}>
                  <Text style={{ fontWeight: "700" }}>{z.nombre}</Text>
                  <Text style={{ color: colors.muted }}>{z.lugarTipico}</Text>
                  <Text style={{ marginTop: 6, color: colors.primary }}>Tocar para abrir en Mapas</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        
        {mode === "platos" &&
          Object.entries(platosPorZona).flatMap(([zonaId, dishes]) => {
            const z = zonasMap[zonaId as ZonaId];
            return dishes.map((p, i) => {
              const coord = scatterCoord(z.centroid.latitude, z.centroid.longitude, dishes.length, i);
              return (
                <Marker
                  key={`plato-${p.id}`}
                  coordinate={coord}
                  title={p.nombre}
                  description={`Zona: ${z.nombre}`}
                  pinColor="#E53935"
                >
                  <Callout>
                    <View style={{ maxWidth: 240 }}>
                      <Text style={{ fontWeight: "700" }}>{p.nombre}</Text>
                      <Text style={{ color: colors.muted }}>Zona: {z.nombre}</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            });
          })}

        {mode === "lugares" &&
          dishKey &&
          places.map((p) => (
            <Marker
              key={`place-${p.id}`}
              coordinate={{ latitude: p.coords.lat, longitude: p.coords.lng }}
              title={p.name}
              description={p.address}
              pinColor="#10B981"
            >
              <Callout onPress={() => openInMaps(p.coords.lat, p.coords.lng, p.name)}>
                <View style={{ maxWidth: 240 }}>
                  <Text style={{ fontWeight: "700" }}>{p.name}</Text>
                  {!!p.address && <Text style={{ color: colors.muted }}>{p.address}</Text>}
                  <Text style={{ marginTop: 6, color: colors.primary }}>Tocar para abrir en Mapas</Text>
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>

      <OverlayCard>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18 }}>Mapa</Text>
          <Text style={{ color: colors.muted }}>{locError ? "Ubicación desactivada" : ""}</Text>
        </View>

        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <ModeChip active={mode === "zonas"} label="Zonas" onPress={() => setMode("zonas")} />
          <ModeChip active={mode === "platos"} label="Platos" onPress={() => setMode("platos")} />
          {dishKey ? (
            <ModeChip active={mode === "lugares"} label="Lugares cercanos" onPress={() => setMode("lugares")} />
          ) : null}
        </View>

        {mode === "platos" && (
          <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: colors.subtitle, fontWeight: "700" }}>{platosVisibles.length} platos</Text>
          </View>
        )}

        <View style={{ marginTop: 8 }}>
          <MapFilters
            zonaSel={zonaSel}
            onZona={setZonaSel}
            picoSel={picoSel}
            onPico={setPicoSel}
            disabled={mode !== "platos"}
          />
        </View>

        {mode !== "platos" && (
          <Text style={{ color: colors.subtitle, marginTop: 6, fontSize: 12 }}>
            Los filtros aplican en “Platos”.
          </Text>
        )}
      </OverlayCard>

      {mode === "lugares" && dishKey && (
        <View style={{ position: "absolute", left: 12, right: 12, bottom: Platform.OS === "android" ? 12 : 24 }}>
          {loadingPlaces ? (
            <View style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 12, alignSelf: "flex-start" }}>
              <ActivityIndicator />
            </View>
          ) : errorPlaces ? (
            <View style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 12 }}>
              <Text style={{ color: colors.text }}>Error: {String(errorPlaces)}</Text>
            </View>
          ) : !places.length ? (
            <View style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 12 }}>
              <Text style={{ color: colors.text }}>No hay lugares cercanos para este plato.</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
