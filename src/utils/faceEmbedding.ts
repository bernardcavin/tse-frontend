import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs-core';
import type { TFLiteModel } from '@tensorflow/tfjs-tflite';
import { loadTFLiteModel, setWasmPath } from '@tensorflow/tfjs-tflite';

// Point to WASM files copied to /public
setWasmPath('/');

const MODEL_INPUT_SIZE = 160;
const MODEL_URL = '/facenet.tflite';

let _model: TFLiteModel | null = null;

async function getModel(): Promise<TFLiteModel> {
  if (_model) return _model;
  _model = await loadTFLiteModel(MODEL_URL);
  return _model;
}

/**
 * Draw an image onto a canvas, resize to 160x160, and return normalised Float32Array.
 */
function preprocessImage(img: HTMLImageElement): Float32Array {
  const canvas = document.createElement('canvas');
  canvas.width = MODEL_INPUT_SIZE;
  canvas.height = MODEL_INPUT_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Center-crop to square (face region) before resizing
  const cropSize = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - cropSize) / 2;
  const sy = (img.naturalHeight - cropSize) / 2;
  ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const imageData = ctx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const { data } = imageData;

  const numPixels = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;
  const rgbData = new Float32Array(numPixels * 3);

  for (let i = 0; i < numPixels; i++) {
    rgbData[i * 3 + 0] = data[i * 4 + 0]; // R
    rgbData[i * 3 + 1] = data[i * 4 + 1]; // G
    rgbData[i * 3 + 2] = data[i * 4 + 2]; // B
  }

  // Per-image standardisation: (pixel - mean) / std
  let sum = 0;
  for (let i = 0; i < rgbData.length; i++) sum += rgbData[i];
  const mean = sum / rgbData.length;

  let sqSum = 0;
  for (let i = 0; i < rgbData.length; i++) sqSum += (rgbData[i] - mean) ** 2;
  const std = Math.sqrt(sqSum / rgbData.length) + 1e-7;

  for (let i = 0; i < rgbData.length; i++) {
    rgbData[i] = (rgbData[i] - mean) / std;
  }

  return rgbData;
}

/**
 * Load an image from a base64 data URI and wait for it to be ready.
 */
function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });
}

/**
 * Compute a face embedding from a base64-encoded image (data URI).
 * Returns a number[] embedding vector.
 */
export async function getFaceEmbedding(imageBase64: string): Promise<number[]> {
  const model = await getModel();
  const img = await loadImage(imageBase64);
  const inputData = preprocessImage(img);

  // Create a proper tf.Tensor with batch dimension [1, 160, 160, 3]
  const inputTensor = tf.tensor4d(inputData, [1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);

  // Run inference
  const outputTensor = model.predict(inputTensor) as tf.Tensor;
  const rawEmbedding = outputTensor.dataSync();

  // Clean up tensors
  inputTensor.dispose();
  outputTensor.dispose();

  // L2 normalise
  let norm = 0;
  for (let i = 0; i < rawEmbedding.length; i++) {
    norm += rawEmbedding[i] * rawEmbedding[i];
  }
  norm = Math.sqrt(norm);

  const embedding: number[] = [];
  for (let i = 0; i < rawEmbedding.length; i++) {
    embedding.push(norm > 0 ? rawEmbedding[i] / norm : 0);
  }

  return embedding;
}
