import { apiClient } from "./api";
import { decryptEnvelope } from "../utils/crypto/envelope";


export interface FileMetadata {
  id: number;
  filename_original: string;
  size_bytes: number;
  created_at: string;
  version: number;
  kdf: string;
  kdf_params: Record<string, unknown>;
  salt: string;
  nonce: string;
}

export interface UploadResponse {
  message: string;
  file_id: number;
}

export const filesService = {
  async listFiles(token: string): Promise<FileMetadata[]> {
    return apiClient.get<FileMetadata[]>("/files", token);
  },

  async uploadFile(formData: FormData, token: string): Promise<UploadResponse> {
    return apiClient.postFormData<UploadResponse>(
      "/files/upload-multipart",
      formData,
      token
    );
  },

  async downloadFile(
    fileId: number,
    password: string,
    token: string
  ): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:4004";

  const response = await fetch(`${baseUrl}/files/download/${fileId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => "");
    throw new Error(msg || "Failed to download envelope");
  }

  const envelopeResponse = await response.json();
  const envelope = envelopeResponse.envelope_json;

  // Decripta localmente usando o mesmo KDF scrypt
  const decryptedBytes = await decryptEnvelope(envelope, password);

  // Cria o download
  const blob = new Blob([decryptedBytes]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = envelopeResponse.filename_original;
  a.click();
},

  async deleteFile(fileId: number, token: string): Promise<void> {
    return apiClient.delete(`/files/${fileId}`, token);
  },
};
