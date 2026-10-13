import Compressor from "compressorjs";

const WATERMARK_SRC = "/Icon-192.png";
const WATERMARK_WIDTH_RATIO = 0.1;
const WATERMARK_PADDING_RATIO = 0.02;

const loadImage = (src, errorMessage) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(errorMessage));
    img.src = src;
  });

let watermarkPromise;
const loadWatermark = () => {
  watermarkPromise ??= loadImage(
    WATERMARK_SRC,
    "Failed to load watermark icon. Check path/availability.",
  ).catch((error) => {
    watermarkPromise = undefined;
    throw error;
  });
  return watermarkPromise;
};

const canvasToBlob = (canvas, type) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas to Blob conversion failed"));
    }, type);
  });

// Stamps the studio logo in the bottom-left corner and returns a new File
// with the original name.
export const addWatermark = async (imageFile) => {
  const objectUrl = URL.createObjectURL(imageFile);
  try {
    const [img, watermark] = await Promise.all([
      loadImage(objectUrl, "Failed to load image for watermarking."),
      loadWatermark(),
    ]);

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const scaledWidth = img.width * WATERMARK_WIDTH_RATIO;
    const scaledHeight = watermark.height * (scaledWidth / watermark.width);
    const watermarkWidth = Math.min(scaledWidth, img.width);
    const watermarkHeight = Math.min(scaledHeight, img.height);
    const padding = img.width * WATERMARK_PADDING_RATIO;
    ctx.drawImage(
      watermark,
      padding,
      img.height - watermarkHeight - padding,
      watermarkWidth,
      watermarkHeight,
    );

    const blob = await canvasToBlob(canvas, imageFile.type || "image/png");
    return new File([blob], imageFile.name, { type: blob.type });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const compressImage = (image) =>
  new Promise((resolve, reject) => {
    new Compressor(image, {
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      success: resolve,
      error: reject,
    });
  });
