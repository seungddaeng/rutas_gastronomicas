import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import fg from 'fast-glob';
import path from 'node:path';
import fs from 'node:fs';

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER_PLATOS,
  CLOUDINARY_UPLOAD_PRESET,
} = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Faltan credenciales Cloudinary en .env.cloudinary');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const LOCAL_DIR = 'assets/images';

const run = async () => {
  const files = await fg([`${LOCAL_DIR}/**/*.{jpg,jpeg,png,webp}`], { dot: false });
  if (!files.length) {
    console.log(`No encontré imágenes en ${LOCAL_DIR}`);
    return;
  }

  const results = {};
  console.log(`Subiendo ${files.length} imágenes a Cloudinary...`);

  for (const file of files) {
    const base = path.parse(file).name;   
    const folder = CLOUDINARY_FOLDER_PLATOS || 'platillosRutas';

    try {
      const res = await cloudinary.uploader.upload(file, {
        folder,
        public_id: base,                      
        upload_preset: CLOUDINARY_UPLOAD_PRESET || undefined,
        overwrite: false,
        unique_filename: true,
        use_filename: false,
        resource_type: 'image',
      });

      results[base] = {
        public_id: res.public_id,
        secure_url: res.secure_url,
        width: res.width,
        height: res.height,
        format: res.format,
      };
      console.log(` ${base} -> ${res.public_id}`);
    } catch (err) {
      console.error(` Error subiendo ${file}:`, err?.message || err);
    }
  }

  const outPath = 'data/cloudinary-platos-map.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n🗺️  Mapa generado: ${outPath}`);
};

run().catch((e) => {
  console.error('Error general:', e);
  process.exit(1);
});
