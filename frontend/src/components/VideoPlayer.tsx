import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Video } from "@/services/api";
import { apiService } from "@/services/api";

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose }) => {
  if (!video) return null;

  const videoUrl = apiService.getVideoStreamUrl(video.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl truncate pr-4">{video.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <video
            controls
            className="w-full h-auto max-h-[70vh]"
            preload="metadata"
            controlsList="nodownload"
          >
            <source src={videoUrl} type={video.contentType} />
            Your browser does not support the video tag.
          </video>
          <div className="p-6 space-y-2">
            <div className="text-sm text-muted-foreground">
              <div>File: {video.fileName}</div>
              <div>Size: {formatFileSize(video.fileSize)}</div>
              <div>Uploaded: {formatDate(video.uploadTime)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
