export type CdnOpts = {
  w?: number; h?: number;
  fit?: "fill" | "thumb" | "fit" | "scale" | "crop";
};

export const cloudinaryUrl = (
  publicIdOrUrl: string,
  opts: CdnOpts = { w: 200, h: 200, fit: "thumb" }
) => {
  const isUrl = publicIdOrUrl.startsWith("http");
  const match = /res\.cloudinary\.com\/([^/]+)/.exec(publicIdOrUrl);
  const cloudFromUrl = match?.[1];
  const cloud = cloudFromUrl || process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

  const base = isUrl
    ? publicIdOrUrl.split("/upload/")[0] + "/upload"
    : `https://res.cloudinary.com/${cloud}/image/upload`;

  const { w, h, fit = "thumb" } = opts;
  const trans = [
    "f_auto","q_auto",
    w ? `w_${w}` : null,
    h ? `h_${h}` : null,
    fit ? `c_${fit}` : null,
  ].filter(Boolean).join(",");

  const suffix = isUrl
    ? publicIdOrUrl.split("/upload/").pop()!
    : publicIdOrUrl;

  return `${base}/${trans}/${suffix}`;
};
