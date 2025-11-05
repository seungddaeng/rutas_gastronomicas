import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function GoToLocationFab({
  goToMyLocation,
  jumping,
}: { goToMyLocation: () => void; jumping: boolean }) {
  return (
    <Pressable style={styles.fab} onPress={goToMyLocation} accessibilityLabel="Ir a mi ubicación">
      {jumping ? <ActivityIndicator /> : <Ionicons name="locate" size={22} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    padding: 12,
    borderRadius: 999,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
  },
});