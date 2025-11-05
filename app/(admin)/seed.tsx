import { useState } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { seedAllPlaces } from "../../services/placesRepo";

export default function SeedScreen() {
    const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
    const [msg, setMsg] = useState<string>("");

    async function runSeed() {
        try {
            setStatus("running");
            await seedAllPlaces();
            setStatus("done");
            setMsg("Seed ejecutado. Revisa la colección 'places' en Firestore.");
        } catch (e: any) {
            setStatus("error");
            setMsg(e?.message || "Error ejecutando seed");
        }
    }

    return (
        <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Seed de lugares (DEV)</Text>
            {status === "running" ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <ActivityIndicator />
                    <Text>Sembrando datos…</Text>
                </View>
            ) : (
                <Button title="Ejecutar seed de ejemplo" onPress={runSeed} />
            )}
            {!!msg && <Text>{msg}</Text>}
        </View>
    );
}
