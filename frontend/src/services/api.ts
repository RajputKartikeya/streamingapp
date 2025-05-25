import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export interface Video {
  id: number;
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadTime: string;
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds for video uploads
  });

  async getAllVideos(): Promise<Video[]> {
    const response = await this.api.get<Video[]>("/videos");
    return response.data;
  }

  async getVideoById(id: number): Promise<Video> {
    const response = await this.api.get<Video>(`/videos/${id}`);
    return response.data;
  }

  async uploadVideo(title: string, file: File): Promise<Video> {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    const response = await this.api.post<Video>("/videos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async deleteVideo(id: number): Promise<void> {
    await this.api.delete(`/videos/${id}`);
  }

  getVideoStreamUrl(id: number): string {
    return `${API_BASE_URL}/videos/${id}/stream`;
  }
}

export const apiService = new ApiService();
