import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Renamed from Video to VideoMetadata for clarity
export interface VideoMetadata {
  id: number;
  title: string;
  fileName: string;
  filePath: string; // Path to the original uploaded file
  fileSize: number;
  contentType: string;
  uploadTime: string;
  filePath720p?: string; // Path to 720p version, optional
  filePath1080p?: string; // Path to 1080p version, optional
}

export interface VideoDetails {
  video: VideoMetadata;
  availableQualities: Record<string, string>; // e.g. { "720p": "/api/videos/1/stream?quality=720p" }
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
  });

  async getAllVideos(): Promise<VideoMetadata[]> {
    // Returns list of VideoMetadata
    const response = await this.api.get<VideoMetadata[]>("/videos");
    return response.data;
  }

  async getVideoById(id: number): Promise<VideoDetails> {
    // Returns VideoDetails
    const response = await this.api.get<VideoDetails>(`/videos/${id}`);
    return response.data;
  }

  async uploadVideo(title: string, file: File): Promise<VideoMetadata> {
    // Returns VideoMetadata of the uploaded video
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    const response = await this.api.post<VideoMetadata>(
      "/videos/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async deleteVideo(id: number): Promise<void> {
    await this.api.delete(`/videos/${id}`);
  }

  // This can now take a quality parameter, or use the direct URL from availableQualities
  getVideoStreamUrl(id: number, quality?: string): string {
    let url = `${API_BASE_URL}/videos/${id}/stream`;
    if (quality && quality !== "original") {
      url += `?quality=${quality}`;
    }
    return url;
  }
}

export const apiService = new ApiService();
