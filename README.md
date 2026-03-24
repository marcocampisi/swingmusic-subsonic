# Peppecar Music

Peppecar Music is a modern, premium web client for Subsonic-compatible music servers (Navidrome, Airsonic, Gonic, etc.). It features full synchronization with LRCLIB for lyrics and is specifically designed for a premium streaming experience.

## Features
- **Subsonic API Integration**: Works with all major Subsonic servers.
- **Synced Lyrics**: Native support for OpenSubsonic structured lyrics with an intelligent LRCLIB fallback.
- **Modern UI**: Built with Vue 3, Vite, and Pinia.
- **Docker Ready**: Includes Dockerfile and Docker Compose for easy deployment.

## Deployment

### With Docker
1. Build the image: `docker build -t peppecar-music .`
2. Run the container: `docker-compose up -d`
3. Access at `http://localhost:8080`

### Locally
1. Install dependencies: `yarn install`
2. Run dev server: `yarn dev`
3. Build for production: `yarn build`

---

**[MIT License](https://opensource.org/licenses/MIT) | Copyright (c) 2024 Peppecar**
