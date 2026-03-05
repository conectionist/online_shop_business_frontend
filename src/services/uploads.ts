import { apiClient } from '@/services/api';

interface ImageStagingResponse {
  upload_id: string;
}

export const uploadService = {
  /**
   * Upload an image to the staging area (PROTECTED - requires auth, cookies sent automatically).
   * Returns the opaque upload_id that can be used as primary_image_upload_id
   * when creating products or categories.
   */
  uploadImageToStaging: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ImageStagingResponse>('/uploads/images', formData, {
      headers: {
        // Let Axios compute the correct multipart boundary header
        'Content-Type': undefined as unknown as string,
      },
      timeout: 120000, // 2 minutes for file uploads (global default is 10s)
    });

    return response.data.upload_id;
  },
};

