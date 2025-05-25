package com.streamingapp.service;

import com.streamingapp.model.Video;
import com.streamingapp.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VideoService {
    
    @Autowired
    private VideoRepository videoRepository;
    
    @Value("${app.upload.dir}")
    private String uploadDir;
    
    public List<Video> getAllVideos() {
        return videoRepository.findAllByOrderByUploadTimeDesc();
    }
    
    public Optional<Video> getVideoById(Long id) {
        return videoRepository.findById(id);
    }
    
    public Video uploadVideo(String title, MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new IllegalArgumentException("File must be a video");
        }
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : ".mp4";
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        
        // Save file to disk
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath);
        
        // Create and save video entity
        Video video = new Video(
            title,
            originalFilename,
            filePath.toString(),
            file.getSize(),
            contentType
        );
        
        return videoRepository.save(video);
    }
    
    public void deleteVideo(Long id) throws IOException {
        Optional<Video> videoOpt = videoRepository.findById(id);
        if (videoOpt.isPresent()) {
            Video video = videoOpt.get();
            
            // Delete file from disk
            Path filePath = Paths.get(video.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
            
            // Delete from database
            videoRepository.delete(video);
        }
    }
    
    public File getVideoFile(Long id) {
        Optional<Video> videoOpt = videoRepository.findById(id);
        if (videoOpt.isPresent()) {
            return new File(videoOpt.get().getFilePath());
        }
        return null;
    }
} 