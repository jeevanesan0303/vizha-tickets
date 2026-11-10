
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const imagesFolder = "public/images";

async function optimizeImages(folder) {
  const files = await fs.readdir(folder, {
    withFileTypes: true,
  });

  for (const file of files) {
    const filePath = path.join(folder, file.name);

    if (file.isDirectory()) {
      await optimizeImages(filePath);
      continue;
    }

    if (!/\.(png|jpg|jpeg)$/i.test(file.name)) {
      continue;
    }

    const outputPath = filePath.replace(
      /\.(png|jpg|jpeg)$/i,
      ".webp"
    );

    try {
      const original = await fs.stat(filePath);

      const result = await sharp(filePath)
        .rotate()
        .resize({
          width: 1920,
          withoutEnlargement: true,
        })
        .webp({
          quality: 82,
        })
        .toBuffer();

      // Keep the original if conversion makes it bigger.
      if (result.length >= original.size) {
        console.log("Skipped:", file.name);
        continue;
      }

      await fs.writeFile(outputPath, result);

      console.log("Optimized:", outputPath);
    } catch (error) {
      console.error("Error:", file.name, error);
    }
  }
}

await optimizeImages(imagesFolder);

console.log("All images processed.");
