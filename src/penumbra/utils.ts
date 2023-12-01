import { Buffer } from 'buffer';

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const buffer = Buffer.from(base64, 'base64');
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export async function fetchBinaryFile(filename: string) {
  const response = await fetch(`test-data/bin/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${filename}`);
  }

  return await response.arrayBuffer();
}