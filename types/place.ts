export type LatLng = { lat: number; lng: number };

export type Place = {
    id: string;
    name: string;
    address?: string;
    coords: LatLng;
    dishKeys: string[];
    rating?: number;
    priceLevel?: number;
    openNow?: boolean;
    photos?: string[];
    geohash: string;
};
