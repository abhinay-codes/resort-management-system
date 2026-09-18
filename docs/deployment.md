# Deployment Architecture

This document describes the current local Docker architecture and the planned cloud deployment strategy for the Resort Management System.

## Local Docker Deployment

The system is fully containerized for local development and testing, ensuring parity across different environments.

### Commands

To build and start the entire stack:
```bash
docker compose up --build
```

To stop the stack and remove containers:
```bash
docker compose down
```

### Current Architecture

1. **Frontend (`resort_frontend`):**
   - Built with Node, runs on Nginx Alpine.
   - Listens on Docker port `80`, mapped to host port `5173`.
2. **Backend (`resort_backend`):**
   - Built with Maven, runs on Eclipse Temurin (Java 17).
   - Listens on Docker port `8080`, mapped to host port `8080`.
3. **Database (`resort_db`):**
   - Uses `postgres:15-alpine`.
   - Uses an internal Docker network. The port `5432` is intentionally **not** exposed to the host machine for security; it is only accessible internally by the backend.

```text
GitHub Source
      ↓
Docker Compose
  ├── Frontend Container (Nginx -> React)
  ├── Backend Container (Spring Boot)
  └── Database Container (PostgreSQL)
```

## Planned Cloud Architecture

The future production deployment strategy utilizes managed cloud services for scalability and reliability.
*(Note: This architecture is currently planned, not yet deployed).*

```text
GitHub (Source of Truth)
      ↓
GitHub Actions (CI/CD Pipeline)
  ├── Build React App → Deploy to Vercel (Frontend Hosting)
  ├── Build Spring Boot Jar → Containerize → Push to GHCR
  └── Deploy Docker Container → Render / AWS ECS (Backend Hosting)
      ↓
    Neon (Managed PostgreSQL Database)
```

## Environment Variables

Whether running locally via Docker Compose or deploying to the cloud, the application relies on environment variables. These must be securely managed (e.g., via GitHub Secrets, Vercel Environment Variables, Render Dashboard).

| Variable | Localhost Default | Production Purpose |
|----------|-------------------|--------------------|
| `VITE_API_URL` | `http://localhost:8080` | Build argument for Vite. Must be the public HTTPS URL of the deployed backend. |
| `FRONTEND_URL` | `http://localhost:5173` | Runtime variable for Spring Boot CORS. Must be the public HTTPS URL of the deployed frontend. |
| `DB_URL` | `jdbc:postgresql://db:5432/resort_management` | JDBC connection string to the managed PostgreSQL instance (e.g., Neon). |
| `DB_USERNAME` | `postgres` | Database username. |
| `DB_PASSWORD` | `<placeholder>` | Secure database password. |
| `JWT_SECRET` | `<placeholder>` | 256-bit secure key for signing JWTs. |
| `ADMIN_EMAIL` | `admin@paradiseresort.com` | Root admin email seeded on startup. |
| `ADMIN_PASSWORD` | `<placeholder>` | Root admin password. |

*Warning: Never commit `.env` files to the repository. Use `.env.example` to track required keys.*

## Docker Images & CI/CD (Planned)
## Docker Images

In a future phase, a GitHub Actions workflow will be implemented to automatically build and test the application on every commit to the `master` branch. 
The application produces the following standalone images for deployment:

Upon successful test execution, the pipeline will build optimized Docker images and push them to the **GitHub Container Registry (GHCR)**. Cloud platforms will then be configured to automatically pull the latest images from GHCR upon release.
- **Backend:** `ghcr.io/abhinay-codes/resort-management-system-backend`
- **Frontend:** `ghcr.io/abhinay-codes/resort-management-system-frontend`

*Note: A custom database image is not produced. The system uses the official `postgres:15-alpine` image.*

## GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/docker-publish.yml`) that automatically builds and publishes the backend and frontend application images to the **GitHub Container Registry (GHCR)** on every push to the `master` branch.

### GHCR Package Visibility
By default, GitHub Packages published via Actions might be set to `Private`. To allow external cloud platforms to pull these images without authentication:
1. Navigate to the user's **Packages** tab on GitHub (`https://github.com/abhinay-codes?tab=packages`).
2. Select the `resort-management-system-backend` and `resort-management-system-frontend` packages.
3. Go to **Package Settings** and change the visibility to **Public**.
4. Ensure the packages are linked to the repository.

### Current Status
- **Local Development:** Developers use `docker compose up --build`. The local Nginx container reverse-proxies `/api/*` traffic directly to the backend.
- **Image Publishing:** The GHCR GitHub Actions workflow is configured and publishes tagged backend and frontend images to the registry.

## Cloud Deployment

- **Frontend:** Deployed on Vercel.
- **Backend:** Deployed on Render using the published GHCR Docker image.
- **Database:** Deployed on Neon PostgreSQL.
- **API Routing:** Vercel rewrites `/api/*` requests to the Render backend using `frontend/vercel.json`.
- **Live Website:** https://resort-management-system-nine.vercel.app
- **Deployment Status:** Complete and verified through the live customer flow.
- **Note:** Render Free may spin down after inactivity, so the first request after inactivity can take longer.
