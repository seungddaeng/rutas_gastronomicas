import type { Plato } from "../store/catalog";
import { cloudinaryUrl } from "./cdn";

const mapJson = require("../data/cloudinary-platos-map.json") as Record<
  string,
  { public_id: string; secure_url: string }
>;

export function applyCloudinaryToPlatos(platos: Plato[]): Plato[] {
  return platos.map((p) => {
    const byId = mapJson[p.id];
    const keyFromNombre = p.nombre?.toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]+/g, "");
    const byName = keyFromNombre ? mapJson[keyFromNombre] : undefined;

    const chosen = byId || byName;
    if (!chosen) return p;

    const uri = cloudinaryUrl(chosen.secure_url, { w: 200, h: 200, fit: "thumb" });
    return { ...p, picUri: { uri } };
  });
}
