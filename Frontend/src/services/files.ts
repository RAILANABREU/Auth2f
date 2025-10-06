import { apiClient } from "./api";

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

  async downloadFile(fileId: number, token: string): Promise<Response> {
    const response = await fetch(`http://localhost:8000/api/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    return response;
  },

  async deleteFile(fileId: number, token: string): Promise<void> {
    return apiClient.delete(`/files/${fileId}`, token);
  },
};
