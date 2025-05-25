import { useState, useEffect } from "react";
import { VideoUpload } from "./components/VideoUpload";
import { VideoList } from "./components/VideoList";
import { VideoPlayer } from "./components/VideoPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Video, Loader2, AlertCircle } from "lucide-react";
import type { VideoMetadata } from "./services/api";
import { apiService } from "./services/api";
import { Button } from "./components/ui/button";

function App() {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedVideos = await apiService.getAllVideos();
      setVideos(fetchedVideos);
    } catch (err) {
      setError(
        "Failed to load videos. Please make sure the backend is running."
      );
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUploadSuccess = () => {
    fetchVideos();
  };

  const handleVideoSelect = (video: VideoMetadata) => {
    setSelectedVideo(video);
  };

  const handleVideoDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await apiService.deleteVideo(id);
        setVideos(videos.filter((video) => video.id !== id));
        if (selectedVideo && selectedVideo.id === id) {
          setSelectedVideo(null);
        }
      } catch (err) {
        console.error("Error deleting video:", err);
        alert("Failed to delete video. Please try again.");
      }
    }
  };

  const handlePlayerClose = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-semibold">
              <Video className="w-8 h-8 text-primary" />
              Video Streaming Dashboard
            </CardTitle>
            <p className="text-muted-foreground">
              Upload, manage, and stream your video content with multiple
              quality options.
            </p>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <VideoUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Video Library Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mr-2 text-primary" />
                  Loading videos...
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-destructive">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-destructive-foreground">
                    Error Loading Videos
                  </h3>
                  <p className="text-muted-foreground mb-4 text-center">
                    {error}
                  </p>
                  <Button
                    onClick={fetchVideos}
                    variant="destructive"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <VideoList
                videos={videos}
                onVideoSelect={handleVideoSelect}
                onVideoDelete={handleVideoDelete}
              />
            )}
          </div>
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <VideoPlayer video={selectedVideo} onClose={handlePlayerClose} />
        )}
      </div>
    </div>
  );
}

export default App;
