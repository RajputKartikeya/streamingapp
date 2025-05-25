package com.streamingapp.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
public class Video {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private Long fileSize;
    
    @Column(nullable = false)
    private String contentType;
    
    @Column(nullable = false)
    private LocalDateTime uploadTime;
    
    @Column(nullable = true) // Nullable as they are generated post-upload
    private String filePath720p;
    
    @Column(nullable = true) // Nullable as they are generated post-upload
    private String filePath1080p;
    
    // Constructors
    public Video() {
        this.uploadTime = LocalDateTime.now();
    }
    
    public Video(String title, String fileName, String filePath, Long fileSize, String contentType) {
        this();
        this.title = title;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.contentType = contentType;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public String getContentType() {
        return contentType;
    }
    
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    
    public LocalDateTime getUploadTime() {
        return uploadTime;
    }
    
    public void setUploadTime(LocalDateTime uploadTime) {
        this.uploadTime = uploadTime;
    }
    
    public String getFilePath720p() {
        return filePath720p;
    }
    
    public void setFilePath720p(String filePath720p) {
        this.filePath720p = filePath720p;
    }
    
    public String getFilePath1080p() {
        return filePath1080p;
    }
    
    public void setFilePath1080p(String filePath1080p) {
        this.filePath1080p = filePath1080p;
    }
} 