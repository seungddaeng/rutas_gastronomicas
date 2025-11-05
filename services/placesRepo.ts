import { addDoc, collection, doc, getDocs, orderBy, setDoc, startAt, endAt, query } from "firebase/firestore";
import * as geofire from "geofire-common";
import { db } from "../lib/firebase";
import { FS_COLLECTIONS } from "./firestore/collections";
import type { Place, LatLng } from "../types/place";
import { dishKeyFromName } from "../utils/dishKey";

function placeIdFromName(name: string) {
    return name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

export function buildGeohash(lat: number, lng: number) {
    return geofire.geohashForLocation([lat, lng]);
}

export async function createPlaceAutoId(place: Omit<Place, "id" | "geohash">) {
    const geohash = buildGeohash(place.coords.lat, place.coords.lng);
    const ref = await addDoc(collection(db, FS_COLLECTIONS.PLACES), { ...place, geohash });
    return ref.id;
}

export async function createOrUpdatePlaceById(id: string, place: Omit<Place, "id" | "geohash">) {
    const geohash = buildGeohash(place.coords.lat, place.coords.lng);
    await setDoc(doc(db, FS_COLLECTIONS.PLACES, id), { ...place, geohash }, { merge: true });
}

export async function getNearbyPlacesByDishKey(center: LatLng, radiusInKm: number, dishKey: string): Promise<Place[]> {
    const centerArr: [number, number] = [center.lat, center.lng];
    const bounds = geofire.geohashQueryBounds(centerArr, radiusInKm * 1000);
    const col = collection(db, FS_COLLECTIONS.PLACES);

    const snaps = await Promise.all(bounds.map((b) => getDocs(query(col, orderBy("geohash"), startAt(b[0]), endAt(b[1])))));

    const candidates: Place[] = [];
    for (const snap of snaps) {
        snap.forEach((d) => {
            const data = d.data() as any;
            if (!data?.coords?.lat || !data?.coords?.lng) return;
            if (Array.isArray(data.dishKeys) && data.dishKeys.includes(dishKey)) {
                candidates.push({
                    id: d.id,
                    name: data.name,
                    address: data.address,
                    coords: data.coords,
                    dishKeys: data.dishKeys,
                    rating: data.rating,
                    priceLevel: data.priceLevel,
                    openNow: data.openNow,
                    photos: data.photos,
                    geohash: data.geohash,
                });
            }
        });
    }

    const within = candidates.filter((p) => geofire.distanceBetween([p.coords.lat, p.coords.lng], centerArr) <= radiusInKm);
    within.sort(
        (a, b) =>
            geofire.distanceBetween([a.coords.lat, a.coords.lng], centerArr) -
            geofire.distanceBetween([b.coords.lat, b.coords.lng], centerArr)
    );

    return within;
}

export async function seedAllPlaces() {
    const places: Array<Omit<Place, "id" | "geohash"> & { _id?: string }> = [
        // 1) Plato Paceño Tradicional
        {
            _id: placeIdFromName("Comedor Sopocachi — Plato Paceño"),
            name: "Comedor Sopocachi — Plato Paceño",
            address: "Av. 20 de Octubre, Sopocachi, La Paz",
            coords: { lat: -16.5145, lng: -68.1290 },
            dishKeys: [dishKeyFromName("Plato Paceño Tradicional")],
            rating: 4.4, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Mercado Lanza — Plato Paceño"),
            name: "Mercado Lanza — Plato Paceño",
            address: "Mercado Lanza, Centro, La Paz",
            coords: { lat: -16.4953, lng: -68.1330 },
            dishKeys: [dishKeyFromName("Plato Paceño Tradicional")],
            rating: 4.2, priceLevel: 1, openNow: true, photos: []
        },

        // 2) Fricase
        {
            _id: placeIdFromName("Doña Remedios — Fricase"),
            name: "Doña Remedios — Fricase",
            address: "C. Murillo, Centro, La Paz",
            coords: { lat: -16.4989, lng: -68.1355 },
            dishKeys: [dishKeyFromName("Fricase")],
            rating: 4.5, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Puesto Miraflores — Fricase"),
            name: "Puesto Miraflores — Fricase",
            address: "Av. Saavedra, Miraflores, La Paz",
            coords: { lat: -16.5030, lng: -68.1190 },
            dishKeys: [dishKeyFromName("Fricase")],
            rating: 4.3, priceLevel: 1, openNow: true, photos: []
        },

        // 3) Ají de Fideos
        {
            _id: placeIdFromName("Doña Anita — Ají de Fideos"),
            name: "Doña Anita — Ají de Fideos",
            address: "Mercado Rodríguez, San Pedro, La Paz",
            coords: { lat: -16.5021, lng: -68.1368 },
            dishKeys: [dishKeyFromName("Ají de Fideos")],
            rating: 4.4, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Ají de Fideo San Pedro"),
            name: "Ají de Fideo San Pedro",
            address: "Plaza Sucre, San Pedro, La Paz",
            coords: { lat: -16.5049, lng: -68.1379 },
            dishKeys: [dishKeyFromName("Ají de Fideos")],
            rating: 4.1, priceLevel: 1, openNow: true, photos: []
        },

        // 4) Sopa de Maní
        {
            _id: placeIdFromName("Doña Mary — Sopa de Maní"),
            name: "Doña Mary — Sopa de Maní",
            address: "Av. 16 de Julio, El Alto (Ceja)",
            coords: { lat: -16.5048, lng: -68.1940 },
            dishKeys: [dishKeyFromName("Sopa de Maní")],
            rating: 4.4, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Sopa de Maní Central"),
            name: "Sopa de Maní Central",
            address: "Calle Comercio, Centro, La Paz",
            coords: { lat: -16.4957, lng: -68.1338 },
            dishKeys: [dishKeyFromName("Sopa de Maní")],
            rating: 4.2, priceLevel: 1, openNow: true, photos: []
        },

        // 5) Chairo Paceño
        {
            _id: placeIdFromName("Chairo de Sopocachi"),
            name: "Chairo de Sopocachi",
            address: "Plaza Abaroa, Sopocachi, La Paz",
            coords: { lat: -16.5128, lng: -68.1276 },
            dishKeys: [dishKeyFromName("Chairo Paceño")],
            rating: 4.5, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Chairo Mercado Rodríguez"),
            name: "Chairo Mercado Rodríguez",
            address: "Mercado Rodríguez, San Pedro, La Paz",
            coords: { lat: -16.5030, lng: -68.1362 },
            dishKeys: [dishKeyFromName("Chairo Paceño")],
            rating: 4.3, priceLevel: 1, openNow: true, photos: []
        },

        // 6) Silpancho
        {
            _id: placeIdFromName("Silpanchería Miraflores"),
            name: "Silpanchería Miraflores",
            address: "Av. Saavedra, Miraflores, La Paz",
            coords: { lat: -16.5045, lng: -68.1205 },
            dishKeys: [dishKeyFromName("Silpancho")],
            rating: 4.6, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Silpancho San Miguel"),
            name: "Silpancho San Miguel",
            address: "San Miguel, Calacoto, La Paz",
            coords: { lat: -16.5410, lng: -68.0780 },
            dishKeys: [dishKeyFromName("Silpancho")],
            rating: 4.4, priceLevel: 2, openNow: true, photos: []
        },

        // 7) Pique Macho
        {
            _id: placeIdFromName("Pique Macho San Pedro"),
            name: "Pique Macho San Pedro",
            address: "Plaza Sucre, San Pedro, La Paz",
            coords: { lat: -16.5047, lng: -68.1388 },
            dishKeys: [dishKeyFromName("Pique Macho")],
            rating: 4.4, priceLevel: 2, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Pique Macho Sopocachi"),
            name: "Pique Macho Sopocachi",
            address: "Av. 20 de Octubre, Sopocachi, La Paz",
            coords: { lat: -16.5149, lng: -68.1300 },
            dishKeys: [dishKeyFromName("Pique Macho")],
            rating: 4.3, priceLevel: 2, openNow: true, photos: []
        },

        // 8) Sajta de Pollo
        {
            _id: placeIdFromName("Sajta El Alto"),
            name: "Sajta El Alto",
            address: "Av. 6 de Marzo, El Alto",
            coords: { lat: -16.5085, lng: -68.1885 },
            dishKeys: [dishKeyFromName("Sajta de Pollo")],
            rating: 4.2, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Sajta de Pollo Central"),
            name: "Sajta de Pollo Central",
            address: "Av. Mariscal Santa Cruz, Centro, La Paz",
            coords: { lat: -16.4978, lng: -68.1359 },
            dishKeys: [dishKeyFromName("Sajta de Pollo")],
            rating: 4.1, priceLevel: 1, openNow: true, photos: []
        },

        // 9) Chicharrón de Cerdo
        {
            _id: placeIdFromName("Chicharronería La Riel"),
            name: "Chicharronería La Riel",
            address: "Zona Max Paredes, La Paz",
            coords: { lat: -16.4960, lng: -68.1470 },
            dishKeys: [dishKeyFromName("Chicharrón de Cerdo")],
            rating: 4.6, priceLevel: 2, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Chicharrón Sopocachi"),
            name: "Chicharrón Sopocachi",
            address: "Plaza Abaroa, Sopocachi, La Paz",
            coords: { lat: -16.5132, lng: -68.1278 },
            dishKeys: [dishKeyFromName("Chicharrón de Cerdo")],
            rating: 4.3, priceLevel: 2, openNow: true, photos: []
        },

        // 10) Rostro Asado
        {
            _id: placeIdFromName("Rostro Asado Miraflores"),
            name: "Rostro Asado Miraflores",
            address: "C. Landaeta, Miraflores, La Paz",
            coords: { lat: -16.5055, lng: -68.1185 },
            dishKeys: [dishKeyFromName("Rostro Asado")],
            rating: 4.2, priceLevel: 2, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Rostro Asado Central"),
            name: "Rostro Asado Central",
            address: "C. Mercado, Centro, La Paz",
            coords: { lat: -16.4971, lng: -68.1344 },
            dishKeys: [dishKeyFromName("Rostro Asado")],
            rating: 4.1, priceLevel: 2, openNow: true, photos: []
        },

        // 11) Thimpu de Cordero
        {
            _id: placeIdFromName("Thimpu de Cordero El Alto"),
            name: "Thimpu de Cordero El Alto",
            address: "Av. 16 de Julio, El Alto",
            coords: { lat: -16.5038, lng: -68.1930 },
            dishKeys: [dishKeyFromName("Thimpu de Cordero")],
            rating: 4.3, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Thimpu Central"),
            name: "Thimpu Central",
            address: "C. Potosí, Centro, La Paz",
            coords: { lat: -16.4982, lng: -68.1340 },
            dishKeys: [dishKeyFromName("Thimpu de Cordero")],
            rating: 4.1, priceLevel: 1, openNow: true, photos: []
        },

        // 12) Lechón al Horno
        {
            _id: placeIdFromName("Lechón San Pedro"),
            name: "Lechón San Pedro",
            address: "Mercado Rodríguez, San Pedro, La Paz",
            coords: { lat: -16.5032, lng: -68.1365 },
            dishKeys: [dishKeyFromName("Lechón al Horno")],
            rating: 4.5, priceLevel: 2, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Lechón Zona Sur"),
            name: "Lechón Zona Sur",
            address: "San Miguel, Calacoto, La Paz",
            coords: { lat: -16.5412, lng: -68.0782 },
            dishKeys: [dishKeyFromName("Lechón al Horno")],
            rating: 4.3, priceLevel: 2, openNow: true, photos: []
        },

        // 13) Charquekan
        {
            _id: placeIdFromName("Charquekan Sopocachi"),
            name: "Charquekan Sopocachi",
            address: "Av. 20 de Octubre, Sopocachi, La Paz",
            coords: { lat: -16.5140, lng: -68.1298 },
            dishKeys: [dishKeyFromName("Charquekan")],
            rating: 4.4, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Charquekan Mercado Lanza"),
            name: "Charquekan Mercado Lanza",
            address: "Mercado Lanza, Centro, La Paz",
            coords: { lat: -16.4951, lng: -68.1331 },
            dishKeys: [dishKeyFromName("Charquekan")],
            rating: 4.2, priceLevel: 1, openNow: true, photos: []
        },

        // 14) Picante de Pollo
        {
            _id: placeIdFromName("Picante de Pollo Miraflores"),
            name: "Picante de Pollo Miraflores",
            address: "Av. Saavedra, Miraflores, La Paz",
            coords: { lat: -16.5048, lng: -68.1200 },
            dishKeys: [dishKeyFromName("Picante de Pollo")],
            rating: 4.3, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Picante de Pollo Central"),
            name: "Picante de Pollo Central",
            address: "C. Comercio, Centro, La Paz",
            coords: { lat: -16.4965, lng: -68.1340 },
            dishKeys: [dishKeyFromName("Picante de Pollo")],
            rating: 4.1, priceLevel: 1, openNow: true, photos: []
        },

        // 15) Reviro Paceño
        {
            _id: placeIdFromName("Reviro Paceño El Alto"),
            name: "Reviro Paceño El Alto",
            address: "Av. 6 de Marzo, El Alto",
            coords: { lat: -16.5078, lng: -68.1865 },
            dishKeys: [dishKeyFromName("Reviro Paceño")],
            rating: 4.2, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Reviro Paceño Sopocachi"),
            name: "Reviro Paceño Sopocachi",
            address: "Plaza Abaroa, Sopocachi, La Paz",
            coords: { lat: -16.5125, lng: -68.1272 },
            dishKeys: [dishKeyFromName("Reviro Paceño")],
            rating: 4.0, priceLevel: 1, openNow: true, photos: []
        },

        // 16) Papas Rellenas
        {
            _id: placeIdFromName("Papas Rellenas San Pedro"),
            name: "Papas Rellenas San Pedro",
            address: "Plaza Sucre, San Pedro, La Paz",
            coords: { lat: -16.5040, lng: -68.1380 },
            dishKeys: [dishKeyFromName("Papas Rellenas")],
            rating: 4.5, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Papas Rellenas Mercado Rodríguez"),
            name: "Papas Rellenas Mercado Rodríguez",
            address: "Mercado Rodríguez, San Pedro, La Paz",
            coords: { lat: -16.5034, lng: -68.1361 },
            dishKeys: [dishKeyFromName("Papas Rellenas")],
            rating: 4.3, priceLevel: 1, openNow: true, photos: []
        },

        // 17) Anticuchos
        {
            _id: placeIdFromName("Doña Tota — Anticuchos"),
            name: "Doña Tota — Anticuchos",
            address: "Av. Montenegro, San Miguel, La Paz",
            coords: { lat: -16.5234, lng: -68.1109 },
            dishKeys: [dishKeyFromName("Anticuchos")],
            rating: 4.6, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Anticuchos Sopocachi"),
            name: "Anticuchos Sopocachi",
            address: "Av. 20 de Octubre, Sopocachi, La Paz",
            coords: { lat: -16.5146, lng: -68.1294 },
            dishKeys: [dishKeyFromName("Anticuchos")],
            rating: 4.4, priceLevel: 1, openNow: true, photos: []
        },

        // 18) Sonso de Yuca
        {
            _id: placeIdFromName("Sonso Zona Sur"),
            name: "Sonso Zona Sur",
            address: "San Miguel, Calacoto, La Paz",
            coords: { lat: -16.5412, lng: -68.0782 },
            dishKeys: [dishKeyFromName("Sonso de Yuca")],
            rating: 4.2, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Sonso Miraflores"),
            name: "Sonso Miraflores",
            address: "Av. Saavedra, Miraflores, La Paz",
            coords: { lat: -16.5042, lng: -68.1193 },
            dishKeys: [dishKeyFromName("Sonso de Yuca")],
            rating: 4.1, priceLevel: 1, openNow: true, photos: []
        },

        // 19) Salteñas
        {
            _id: placeIdFromName("Salteñería El Patio"),
            name: "Salteñería El Patio",
            address: "Calle 21 de Calacoto 456, La Paz",
            coords: { lat: -16.5412, lng: -68.0786 },
            dishKeys: [dishKeyFromName("Salteñas")],
            rating: 4.5, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Paceña La Salteña (Centro)"),
            name: "Paceña La Salteña (Centro)",
            address: "Calle Loayza 233, Centro, La Paz",
            coords: { lat: -16.4988, lng: -68.1348 },
            dishKeys: [dishKeyFromName("Salteñas")],
            rating: 4.6, priceLevel: 1, openNow: true, photos: []
        },

        // 20) Tucumanas
        {
            _id: placeIdFromName("Tucumanas San Pedro"),
            name: "Tucumanas San Pedro",
            address: "Plaza Sucre, San Pedro, La Paz",
            coords: { lat: -16.5046, lng: -68.1383 },
            dishKeys: [dishKeyFromName("Tucumanas")],
            rating: 4.4, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Tucumanas de la Zona Sur"),
            name: "Tucumanas de la Zona Sur",
            address: "San Miguel, Calacoto, La Paz",
            coords: { lat: -16.5410, lng: -68.0780 },
            dishKeys: [dishKeyFromName("Tucumanas")],
            rating: 4.3, priceLevel: 1, openNow: true, photos: []
        },

        // 21) Ranga Ranga
        {
            _id: placeIdFromName("Ranga Ranga Sopocachi"),
            name: "Ranga Ranga Sopocachi",
            address: "Av. 20 de Octubre, Sopocachi, La Paz",
            coords: { lat: -16.5142, lng: -68.1292 },
            dishKeys: [dishKeyFromName("Ranga Ranga")],
            rating: 4.3, priceLevel: 1, openNow: true, photos: []
        },
        {
            _id: placeIdFromName("Ranga Ranga Central"),
            name: "Ranga Ranga Central",
            address: "Calle Comercio, Centro, La Paz",
            coords: { lat: -16.4960, lng: -68.1341 },
            dishKeys: [dishKeyFromName("Ranga Ranga")],
            rating: 4.1, priceLevel: 1, openNow: true, photos: []
        },
    ];

    for (const p of places) {
        const id = p._id ?? placeIdFromName(p.name);
        await createOrUpdatePlaceById(id, {
            name: p.name,
            address: p.address,
            coords: p.coords,
            dishKeys: p.dishKeys,
            rating: p.rating,
            priceLevel: p.priceLevel,
            openNow: p.openNow,
            photos: p.photos
        });
    }
}
