import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const lookup = new Uint8Array(256);
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for (let i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  let bufferLength = base64.length * 0.75;
  const len = base64.length;
  
  if (base64[len - 1] === '=') {
    bufferLength--;
    if (base64[len - 2] === '=') {
      bufferLength--;
    }
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return arrayBuffer;
}

export const storageService = {
  /**
   * Uploads an image file to Supabase receipts bucket.
   * Handles both local file URIs (Android/iOS) and web data/http URIs.
   */
  async uploadReceipt(fileUri: string, userId: string): Promise<string> {
    if (!fileUri) throw new Error('File URI is required for upload');

    // 1. Generate a unique filename under user's directory
    const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

    let fileBody: ArrayBuffer | Blob;

    if (Platform.OS === 'web' || fileUri.startsWith('data:') || fileUri.startsWith('http')) {
      const response = await fetch(fileUri);
      fileBody = await response.blob();
    } else {
      // Native FileSystem read to base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });
      fileBody = base64ToArrayBuffer(base64);
    }

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, fileBody, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get the public URL of the uploaded receipt
    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  },

  /**
   * Deletes a receipt image from Supabase storage using its public URL.
   */
  async deleteReceipt(publicUrl: string): Promise<void> {
    if (!publicUrl) return;

    try {
      // URL format: https://.../storage/v1/object/public/receipts/userId/filename
      const parts = publicUrl.split('/receipts/');
      if (parts.length < 2) return;
      
      const filePath = parts[1]; // e.g. "userId/filename"
      const { error } = await supabase.storage
        .from('receipts')
        .remove([filePath]);

      if (error) {
        console.warn('Failed to delete receipt from Supabase storage:', error);
      }
    } catch (err) {
      console.warn('Error deleting receipt image:', err);
    }
  },
};
