export type ZonaId = "Miraflores" | "Sopocachi" | "El Alto" | "San Pedro";

export type Zona = {
  id: ZonaId;                 
  nombre: string;             
  centroid: { latitude: number; longitude: number };
  lugarTipico: string;        
};

export const zonas: Zona[] = [
  {
    id: "Miraflores",
    nombre: "Miraflores",
    centroid: { latitude: -16.5030, longitude: -68.1190 },
    lugarTipico: "Mercado Miraflores, La Paz",
  },
  {
    id: "Sopocachi",
    nombre: "Sopocachi",
    centroid: { latitude: -16.5100, longitude: -68.1300 },
    lugarTipico: "Mercado Sopocachi, La Paz",
  },
  {
    id: "El Alto",
    nombre: "El Alto",
    centroid: { latitude: -16.5000, longitude: -68.1920 },
    lugarTipico: "Ceja de El Alto, La Paz",
  },
  {
    id: "San Pedro",
    nombre: "San Pedro",
    centroid: { latitude: -16.5060, longitude: -68.1370 },
    lugarTipico: "Mercado Yungas (San Pedro), La Paz",
  },
];

export const zonasMap = Object.fromEntries(zonas.map(z => [z.id, z])) as Record<ZonaId, Zona>;
export const zonasIds = zonas.map(z => z.id) as ZonaId[];
