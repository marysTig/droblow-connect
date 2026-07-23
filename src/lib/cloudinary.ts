/**
 * Uploads an image file to Cloudinary using an unsigned upload preset.
 * The API Secret must NEVER be used here — browser code is public.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary env vars missing. Ensure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are set in .env",
    );
  }

  console.log("[Cloudinary] Uploading to cloud:", CLOUD_NAME, "| preset:", UPLOAD_PRESET);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const json = await response.json();

  if (!response.ok) {
    const errorMessage = json?.error?.message || JSON.stringify(json);
    console.error("[Cloudinary] Upload error:", errorMessage);
    throw new Error(errorMessage || `Cloudinary upload failed (${response.status})`);
  }

  console.log("[Cloudinary] Upload success:", json.secure_url);
  return json as CloudinaryUploadResult;
}
