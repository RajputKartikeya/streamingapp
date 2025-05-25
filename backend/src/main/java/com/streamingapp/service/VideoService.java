package com.streamingapp.service;

import com.streamingapp.model.Video;
import com.streamingapp.repository.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    
    private static final Logger logger = LoggerFactory.getLogger(VideoService.class);
    
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
    
    public Video uploadVideo(String title, MultipartFile file) throws IOException, InterruptedException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new IllegalArgumentException("File must be a video");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String baseName = UUID.randomUUID().toString();
        String fileExtension = originalFilename != null && originalFilename.contains(".")
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : ".mp4";
        String uniqueFilename = baseName + fileExtension;

        Path originalFilePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), originalFilePath);

        Video video = new Video(
            title,
            originalFilename,
            originalFilePath.toString(),
            file.getSize(),
            contentType
        );
        Video savedVideo = videoRepository.save(video);

        // Transcoding
        String output720pPath = transcodeVideo(originalFilePath, baseName, "720p", fileExtension);
        String output1080pPath = transcodeVideo(originalFilePath, baseName, "1080p", fileExtension);

        if (output720pPath != null) {
            savedVideo.setFilePath720p(output720pPath);
        }
        if (output1080pPath != null) {
            savedVideo.setFilePath1080p(output1080pPath);
        }
        return videoRepository.save(savedVideo);
    }
    
    private String transcodeVideo(Path sourcePath, String baseName, String quality, String extension) throws IOException, InterruptedException {
        Path uploadPath = Paths.get(uploadDir);
        String outputFilename = baseName + "_" + quality + extension;
        Path outputPath = uploadPath.resolve(outputFilename);

        logger.info("Transcoding {} to {} at {}", sourcePath, quality, outputPath);

        String scale = "";
        if ("1080p".equals(quality)) {
            scale = "scale=-1:1080"; // -1 maintains aspect ratio
        }
        else if ("720p".equals(quality)) {
            scale = "scale=-1:720";
        } else {
            logger.warn("Unsupported quality: {}", quality);
            return null;
        }

        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg",
                "-i", sourcePath.toString(),
                "-vf", scale,
                "-c:v", "libx264",
                "-preset", "medium", 
                "-crf", "23",
                "-c:a", "aac",
                "-b:a", "128k",
                outputPath.toString()
        );
        processBuilder.redirectErrorStream(true); // Redirects stderr to stdout
        Process process = processBuilder.start();
        
        // Log FFmpeg output
        try (var reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                logger.debug("FFmpeg ({}): {}", quality, line);
            }
        }

        int exitCode = process.waitFor();
        if (exitCode == 0) {
            logger.info("Successfully transcoded to {} at {}", quality, outputPath);
            return outputPath.toString();
        } else {
            logger.error("Failed to transcode to {}. FFmpeg exit code: {}", quality, exitCode);
            // Optionally delete failed partial transcode
            Files.deleteIfExists(outputPath);
            return null;
        }
    }
    
    public void deleteVideo(Long id) throws IOException {
        Optional<Video> videoOpt = videoRepository.findById(id);
        if (videoOpt.isPresent()) {
            Video video = videoOpt.get();
            Files.deleteIfExists(Paths.get(video.getFilePath()));
            if (video.getFilePath720p() != null) Files.deleteIfExists(Paths.get(video.getFilePath720p()));
            if (video.getFilePath1080p() != null) Files.deleteIfExists(Paths.get(video.getFilePath1080p()));
            videoRepository.delete(video);
        }
    }
    
    public File getVideoFile(Long id, String quality) {
        Optional<Video> videoOpt = videoRepository.findById(id);
        if (videoOpt.isPresent()) {
            Video video = videoOpt.get();
            if ("1080p".equalsIgnoreCase(quality) && video.getFilePath1080p() != null) {
                return new File(video.getFilePath1080p());
            }
            if ("720p".equalsIgnoreCase(quality) && video.getFilePath720p() != null) {
                return new File(video.getFilePath720p());
            }
            // Default to original if specific quality not found or not requested
            return new File(video.getFilePath());
        }
        return null;
    }

    // Overload for original quality or default
    public File getVideoFile(Long id) {
        return getVideoFile(id, null); 
    }
} 