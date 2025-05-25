import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Loader2, AlertCircle } from "lucide-react";
import type { VideoMetadata, VideoDetails } from "@/services/api";
import { apiService } from "@/services/api";

interface VideoPlayerProps {
  video: VideoMetadata | null;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose }) => {
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video && video.id) {
      setIsLoadingDetails(true);
      setErrorDetails(null);
      apiService
        .getVideoById(video.id)
        .then((details) => {
          setVideoDetails(details);
          const initialQualityUrl =
            details.availableQualities.original ||
            Object.values(details.availableQualities)[0];
          setCurrentStreamUrl(
            initialQualityUrl
              ? `${
                  apiService.getVideoStreamUrl(0).split("/api")[0]
                }${initialQualityUrl}`
              : null
          );
        })
        .catch((err) => {
          console.error("Error fetching video details:", err);
          setErrorDetails("Failed to load video details and qualities.");
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    } else {
      setVideoDetails(null);
      setCurrentStreamUrl(null);
    }
  }, [video]);

  const handleQualityChange = (qualityKey: string) => {
    if (videoDetails && videoDetails.availableQualities[qualityKey]) {
      const newUrl = `${apiService.getVideoStreamUrl(0).split("/api")[0]}${
        videoDetails.availableQualities[qualityKey]
      }`;
      setCurrentStreamUrl(newUrl);
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const isPaused = videoRef.current.paused;
        videoRef.current.load();
        videoRef.current.currentTime = currentTime;
        if (!isPaused) {
          videoRef.current
            .play()
            .catch((e) =>
              console.error("Error playing video after quality change:", e)
            );
        }
      }
    }
  };

  if (!video) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col bg-background/80 shadow-2xl rounded-lg border border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b bg-background/90">
          <CardTitle className="text-xl truncate pr-4">{video.title}</CardTitle>
          <div className="flex items-center space-x-2">
            {videoDetails &&
              Object.keys(videoDetails.availableQualities).length > 1 && (
                <div className="flex items-center space-x-1">
                  {Object.entries(videoDetails.availableQualities).map(
                    ([key, value]) => {
                      const fullUrl = `${
                        apiService.getVideoStreamUrl(0).split("/api")[0]
                      }${value}`;
                      const isActive = currentStreamUrl === fullUrl;
                      return (
                        <Button
                          key={key}
                          variant={isActive ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => handleQualityChange(key)}
                          className={`capitalize text-xs ${
                            isActive ? "font-semibold" : ""
                          }`}
                        >
                          {key}
                        </Button>
                      );
                    }
                  )}
                </div>
              )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-grow flex items-center justify-center bg-background/50">
          {isLoadingDetails ? (
            <div className="text-white">
              <Loader2 className="h-8 w-8 animate-spin mr-2 inline" /> Loading
              video details...
            </div>
          ) : errorDetails ? (
            <div className="text-destructive-foreground bg-destructive p-4 rounded-md flex items-center">
              <AlertCircle className="h-6 w-6 mr-2" /> {errorDetails}
            </div>
          ) : currentStreamUrl ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full h-auto max-h-[calc(95vh-150px)] object-contain"
              preload="metadata"
              controlsList="nodownload"
              key={currentStreamUrl}
            >
              <source
                src={currentStreamUrl}
                type={videoDetails?.video.contentType || "video/mp4"}
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-muted-foreground">
              No video stream available.
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t bg-background/90 text-sm text-foreground">
          <div>File: {video.fileName}</div>
          <div>Size: {formatFileSize(video.fileSize)}</div>
          <div>Uploaded: {formatDate(video.uploadTime)}</div>
        </div>
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
