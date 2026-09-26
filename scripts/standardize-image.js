const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Normaliza cualquier imagen a 512x512 (.webp) sin recortar ni distorsionar.
 * @param {string|Buffer} input - URL remota, ruta local o Buffer binario.
 * @param {string} outputPath - Destino del archivo procesado (.webp).
 * @param {'white' | 'blur'} mode - 'white' para marco limpio de catálogo, 'blur' para afiches con fondo adaptativo.
 * @param {Object} options - Configuraciones adicionales { entityType: 'PRODUCT' | 'PROMOTION' }
 */
async function standardizeTo512(input, outputPath, mode = 'blur', options = { entityType: 'PRODUCT' }) {
  try {
    let imageBuffer;

    if (typeof input === 'string' && input.startsWith('http')) {
      const response = await fetch(input);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else if (typeof input === 'string') {
      imageBuffer = fs.readFileSync(input);
    } else {
      imageBuffer = input;
    }

    if (options.entityType === 'PROMOTION') {
      await sharp(imageBuffer)
        .webp({ quality: 85 })
        .toFile(outputPath);
      console.log(`[OK] Promoción optimizada (sin recortar) -> ${outputPath}`);
      return true;
    }

    if (mode === 'blur') {
      const background = await sharp(imageBuffer)
        .resize(512, 512, { fit: 'cover' })
        .blur(20)
        .modulate({ brightness: 0.85 })
        .toBuffer();

      const foreground = await sharp(imageBuffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();

      await sharp(background)
        .composite([{ input: foreground, gravity: 'center' }])
        .webp({ quality: 85 })
        .toFile(outputPath);

    } else {
      await sharp(imageBuffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .webp({ quality: 85 })
        .toFile(outputPath);
    }

    console.log(`[OK] Imagen estandarizada en 512x512 -> ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Procesamiento de imagen falló: ${error.message}`);
    return false;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const input = args[0] || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400';
  const output = args[1] || path.join(__dirname, 'test-output-512.webp');
  const mode = args[2] || 'blur';

  console.log(`Probando standardizeTo512 con modo: ${mode}...`);
  standardizeTo512(input, output, mode).then(success => {
    if (!success) process.exit(1);
  });
}

module.exports = { standardizeTo512 };
