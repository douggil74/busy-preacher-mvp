const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImage(inputPath, outputPath, quality = 80) {
  try {
    const input = path.join(__dirname, '..', inputPath);
    const output = path.join(__dirname, '..', outputPath);

    console.log(`Optimizing ${inputPath}...`);

    const info = await sharp(input)
      .resize(1024, 1024, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality })
      .toFile(output);

    const originalSize = fs.statSync(input).size;
    const newSize = info.size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    console.log(`✅ ${inputPath}`);
    console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Optimized: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Savings: ${savings}%\n`);

    return { inputPath, originalSize, newSize, savings };
  } catch (error) {
    console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
    return null;
  }
}

async function optimizeAll() {
  console.log('🖼️  Starting image optimization...\n');

  const images = [
    { input: 'public/logo.png', output: 'public/logo.webp', quality: 85 },
    { input: 'public/splash screen wider.png', output: 'public/splash.webp', quality: 85 },
    { input: 'public/app-icon-dark.png', output: 'public/app-icon-dark.webp', quality: 90 },
  ];

  const results = [];

  for (const img of images) {
    const result = await optimizeImage(img.input, img.output, img.quality);
    if (result) results.push(result);
  }

  console.log('\n📊 Summary:');
  console.log('═══════════════════════════════════════════');

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
  const totalSavings = ((totalOriginal - totalNew) / totalOriginal * 100).toFixed(1);

  console.log(`Total original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total optimized size: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total savings: ${totalSavings}%`);
  console.log(`Saved: ${((totalOriginal - totalNew) / 1024 / 1024).toFixed(2)} MB\n`);

  console.log('✅ Image optimization complete!');
  console.log('\n💡 Next steps:');
  console.log('1. Update image references to use .webp versions');
  console.log('2. Add fallbacks for browsers without WebP support');
  console.log('3. Run npm run build to verify bundle sizes');
}

optimizeAll().catch(console.error);
