import { useEffect, useState } from "react";
import type { Place } from "../types/place";
import { getNearbyPlacesByDishKey } from "../services/placesRepo";

type Opts = {
    center: { lat: number; lng: number } | null;
    radiusKm: number;
    dishKey: string;
};

export function useNearbyPlaces({ center, radiusKm, dishKey }: Opts) {
    const [data, setData] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<null | string>(null);

    useEffect(() => {
        let alive = true;
        async function run() {
            if (!center || !dishKey) return;
            setLoading(true);
            setError(null);
            try {
                const res = await getNearbyPlacesByDishKey(center, radiusKm, dishKey);
                if (alive) setData(res);
            } catch (e: any) {
                if (alive) setError(e?.message || "Error fetching places");
            } finally {
                if (alive) setLoading(false);
            }
        }
        run();
        return () => { alive = false; };
    }, [center?.lat, center?.lng, radiusKm, dishKey]);

    return { data, loading, error };
}
