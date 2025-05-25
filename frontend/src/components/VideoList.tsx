import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play, Trash2, Calendar, FileVideo } from "lucide-react";
import type { Video } from "@/services/api";

interface VideoListProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  onVideoDelete: (id: number) => void;
}

export const VideoList: React.FC<VideoListProps> = ({
  videos,
  onVideoSelect,
  onVideoDelete,
}) => {
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

  if (videos.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileVideo className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No videos uploaded yet</h3>
          <p className="text-muted-foreground text-center">
            Upload your first video to get started with your streaming library.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Video Library</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg truncate" title={video.title}>
                {video.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(video.uploadTime)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <div>File: {video.fileName}</div>
                <div>Size: {formatFileSize(video.fileSize)}</div>
                <div>Type: {video.contentType}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => onVideoSelect(video)}
                  className="flex-1"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
                <Button
                  onClick={() => onVideoDelete(video.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
