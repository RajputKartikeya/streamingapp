package com.streamingapp.controller;

import com.streamingapp.model.Video;
import com.streamingapp.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/videos")
public class VideoController {
    
    @Autowired
    private VideoService videoService;
    
    @GetMapping
    public ResponseEntity<List<Video>> getAllVideos() {
        List<Video> videos = videoService.getAllVideos();
        return ResponseEntity.ok(videos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getVideoById(@PathVariable Long id) {
        Optional<Video> videoOptional = videoService.getVideoById(id);
        if (videoOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Video video = videoOptional.get();
        Map<String, Object> response = new HashMap<>();
        response.put("video", video);
        
        Map<String, String> availableQualities = new HashMap<>();
        availableQualities.put("original", "/api/videos/" + id + "/stream");
        if (video.getFilePath720p() != null) {
            availableQualities.put("720p", "/api/videos/" + id + "/stream?quality=720p");
        }
        if (video.getFilePath1080p() != null) {
            availableQualities.put("1080p", "/api/videos/" + id + "/stream?quality=1080p");
        }
        response.put("availableQualities", availableQualities);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadVideo(
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file) {
        try {
            Video video = videoService.uploadVideo(title, file);
            return ResponseEntity.ok(video);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt(); // Restore interruption status
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error uploading or transcoding file: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}/stream")
    public ResponseEntity<Resource> streamVideo(
            @PathVariable Long id,
            @RequestParam(required = false) String quality) {
        File videoFile = videoService.getVideoFile(id, quality);
        
        if (videoFile == null || !videoFile.exists()) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<Video> videoOpt = videoService.getVideoById(id);
        if (videoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Video video = videoOpt.get();
        Resource resource = new FileSystemResource(videoFile);
        
        String contentType = video.getContentType();
        // Determine content type based on the actual file being served if it's a transcoded version
        // This is a simplified assumption; a more robust way would be to store content type per version
        // or use a library to detect it from the file.
        if (quality != null && (video.getFilePath720p() != null || video.getFilePath1080p() != null)){
             contentType = "video/mp4"; // Assuming transcoded versions are mp4
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + video.getFileName() + "\"")
                .body(resource);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
        try {
            videoService.deleteVideo(id);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error deleting video: " + e.getMessage());
        }
    }
} 