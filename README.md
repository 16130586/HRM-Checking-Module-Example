# Face Checking In

Face attendance application with a .NET 8 API, PostgreSQL with pgvector, and a React/Vite frontend for face registration and check-in.

## Project structure

- `FaceAPI/FaceAPI` - ASP.NET Core API, EF Core, PostgreSQL/pgvector, and ONNX face embeddings
- `FaceGuiding/face-attendance-ui` - React frontend
- `docker-compose.yml` - PostgreSQL with pgvector
- `ngrok.yml` - local tunnel definitions without credentials

## Requirements

- .NET 8 SDK
- Node.js and npm
- Docker Desktop
- Git LFS for the ONNX model

The API uses `SixLabors.ImageSharp` `2.1.7` and does not include the unused `ImageSharp.Drawing` package, so the Docker build does not require a Six Labors license.

## Run locally

Start PostgreSQL and the API with Docker:

```powershell
docker compose up -d --build
```

The API is available at `http://localhost:5094` and Swagger is available at `http://localhost:5094/swagger`.

To start only the database:

```powershell
docker compose up -d postgres-pgvector
```

Start the API:

```powershell
cd FaceAPI/FaceAPI
dotnet restore
dotnet run
```

When running the API outside Docker, PostgreSQL must be available at `localhost:5432`.

Install frontend dependencies and start Vite:

```powershell
cd FaceGuiding/face-attendance-ui
npm install
npm run dev
```

The frontend uses Vite's development server. Configure the API base URL in the frontend service/configuration when using a non-default API address.

## Build and checks

```powershell
cd FaceGuiding/face-attendance-ui
npm run lint
npm run build
```

The ONNX model is stored with Git LFS. Run `git lfs pull` after cloning if the model is not present locally.

## Ngrok

Authenticate ngrok through its local CLI configuration or environment. Credentials are intentionally not stored in `ngrok.yml`.

```powershell
ngrok start --all --config ngrok.yml
```
