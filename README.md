This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Running the application

The easiest way to deploy New Wallpaper Who Dis is by downloading the pre-configured `docker-compose.yml` file and running it. You do not need to download the full source code.

1. Download the `docker-compose.yml` file to your server or local machine into an empty directory.
2. Run the following command:

```bash
docker-compose up -d
```

The application will be accessible locally at `http://localhost:6767`.

*Note: Data and uploaded wallpapers are persisted locally in the `./data` and `./wallpapers` directories.*

### Reverse Proxy Setup (Public Access)

If you intend to expose the service to the internet, it is highly recommended to run the container behind a Reverse Proxy like **Nginx Proxy Manager (NPM)**, Traefik, or Cloudflare Tunnels to handle SSL/HTTPS.

1. First, point your domain's DNS (e.g., `wallpaper.yourdomain.com`) to your server's IP address.
2. Ensure your reverse proxy is connected to the same Docker network as this application, or simply forward traffic to port `6767` on the host machine.
3. Pass standard headers (e.g., `Host`, `X-Forwarded-For`, `X-Forwarded-Proto`) in your proxy settings to ensure Next.js routing functions securely over HTTPS.

## Architecture & Resiliency

This project is built on a **Flat File Architecture**, prioritizing simplicity, maintenance-free operation, and platform agnosticism. 

- **Drag-and-Drop Maintenance**: The `/wallpapers` folder on your hard drive is the ultimate source of truth. You don't need to use the web application to manage your library. You can literally drag hundreds of files directly into the folder via Windows Explorer, macOS Finder, or an FTP client. When the app boots or receives a request, the background Auto-Sync crawler automatically discovers, measures, and safely ingests any new files into the gallery web UI.
- **Aggressive Purging**: Unsupported files (e.g. PDFs, TXT, or EXEs) dropped into the folder are aggressively purged by the synchronization engine to prevent bloat and security footprint expansion.
- **Disposable Database Cache**: The internal `/data/db.json` database acts strictly as a high-speed cache for tracking advanced image metadata (like dominant color schemas and orientation tags) to prevent re-processing identical files. **If this file is manually deleted or corrupted, the app will gracefully recover without crashing**. It instantly rebuilds a fresh database skeleton, and the Auto-Sync crawler automatically repopulates all dimensions and tags by rescanning the physical disk.

## Licensing & Default Assets

The core codebase is licensed under the terms described in (`license.md`). The  default wallpapers included upon installation to provide a softer onboarding experience are all royalty-free and generously captured by creators on Unsplash. Please refer to [`LICENSE-ASSETS.md`](./LICENSE-ASSETS.md) for full image attribution and links to the original artists.
