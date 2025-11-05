import { platos as MOCKS } from "./platos";
import type { ImageSourcePropType } from "react-native";

export const imagesById: Record<string, ImageSourcePropType> = Object.fromEntries(
  MOCKS.map((p) => [p.id, p.picUri])
) as Record<string, ImageSourcePropType>;