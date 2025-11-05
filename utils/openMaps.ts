import { Linking } from "react-native";

export function openInGoogleMapsQuery(query: string) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  Linking.openURL(url);
}