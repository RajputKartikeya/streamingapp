# Video Streaming Web App

A minimal yet functional video streaming application built with Spring Boot (backend) and React (frontend). Perfect for portfolio/resume projects.

## Features

- **Backend (Spring Boot)**

  - MP4 video file uploads
  - H2 in-memory database for metadata storage
  - RESTful API for video management
  - HTTP video streaming
  - CORS configured for frontend

- **Frontend (React 18 + TypeScript)**
  - Modern admin dashboard for video management
  - Video upload interface with drag & drop
  - Video listing and playback
  - Responsive design with Tailwind CSS
  - shadcn/ui components for beautiful UI

## Technology Stack

- **Backend**: Spring Boot 2.7, Spring Web, Spring Data JPA, H2 Database
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons
- **API Communication**: Axios
- **Deployment**: Heroku-ready

## Project Structure

```
streamingapp/
├── backend/              # Spring Boot application
│   ├── src/main/java/    # Java source code
│   ├── src/main/resources/ # Application properties
│   ├── pom.xml           # Maven dependencies
│   └── mvnw              # Maven wrapper
├── frontend/             # React TypeScript application
│   ├── src/              # React source code
│   ├── public/           # Static assets
│   ├── package.json      # NPM dependencies
│   └── vite.config.ts    # Vite configuration
├── uploads/              # Video storage directory
├── start.sh              # Quick start script
├── Procfile              # Heroku deployment
└── README.md             # This file
```

## Quick Start

### Option 1: Use the Start Script (Recommended)

```bash
./start.sh
```

This will automatically start both backend and frontend services.

### Option 2: Manual Setup

#### Prerequisites

- Java 17 or higher
- Node.js 14 or higher
- npm or yarn

#### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Run the Spring Boot application:

   ```bash
   ./mvnw spring-boot:run
   ```

   Backend will be available at `http://localhost:8080`

#### Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

## Usage

1. Open `http://localhost:5173` in your browser
2. Use the "Upload Video" section to upload MP4 files
3. View uploaded videos in the "Video Library" section
4. Click on any video to play it in the modal player

## API Endpoints

- `POST /api/videos/upload` - Upload a video file
- `GET /api/videos` - Get all videos metadata
- `GET /api/videos/{id}` - Get specific video metadata
- `GET /api/videos/{id}/stream` - Stream video content
- `DELETE /api/videos/{id}` - Delete a video

## Development Tools

- **H2 Database Console**: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:videostream`
  - Username: `sa`
  - Password: (leave empty)

## Heroku Deployment

1. Create a Heroku app:

   ```bash
   heroku create your-app-name
   ```

2. Set buildpacks:

   ```bash
   heroku buildpacks:add heroku/java
   heroku buildpacks:add heroku/nodejs
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

## Build Commands

### Backend

```bash
cd backend
./mvnw clean package -DskipTests
```

### Frontend

```bash
cd frontend
npm run build
```

## Development Notes

- H2 database is in-memory for simplicity (data resets on restart)
- Videos are stored in `uploads/` directory
- CORS is configured to allow requests from `localhost:5173`
- File size limit is set to 100MB for video uploads
- Frontend uses modern React 18 with TypeScript and Vite
- UI components are built with shadcn/ui and Tailwind CSS

## Screenshots

The application features:

- Clean, modern dashboard interface
- Drag & drop video upload
- Grid-based video library
- Modal video player with controls
- Responsive design for all screen sizes

## Future Enhancements

- User authentication and authorization
- Video thumbnails generation
- Video transcoding for multiple formats
- Persistent database (PostgreSQL)
- Video categories and tags
- Search functionality
- Video compression and optimization
- Real-time upload progress
- Video analytics and metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your portfolio or learning purposes.
