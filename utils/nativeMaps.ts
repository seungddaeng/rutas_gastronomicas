import { Platform, Linking } from "react-native";


export function openInMaps(lat: number, lng: number, label?: string) {
const encodedLabel = label ? encodeURIComponent(label) : undefined;


if (Platform.OS === "ios") {
const url = `http://maps.apple.com/?ll=${lat},${lng}${encodedLabel ? `&q=${encodedLabel}` : ""}`;
Linking.openURL(url);
} else {
const q = encodedLabel ? `${lat},${lng}(${encodedLabel})` : `${lat},${lng}`;
const url = `geo:${lat},${lng}?q=${q}`;
Linking.openURL(url).catch(() => {
const web = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
Linking.openURL(web);
});
}
}


export function navigateInMaps(
origin: { lat: number; lng: number } | null,
destLat: number,
destLng: number,
label?: string
) {
const encodedLabel = label ? encodeURIComponent(label) : undefined;


if (Platform.OS === "ios") {
const url = `http://maps.apple.com/?daddr=${destLat},${destLng}${encodedLabel ? `(${encodedLabel})` : ""}&dirflg=d`;
Linking.openURL(url);
} else {
const url = `google.navigation:q=${destLat},${destLng}&mode=d`;
Linking.openURL(url).catch(() => {
const o = origin ? `${origin.lat},${origin.lng}` : "";
const web = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}${o ? `&origin=${o}` : ""}&travelmode=driving`;
Linking.openURL(web);
});
}
}