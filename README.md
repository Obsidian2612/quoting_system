# Quoting System

An automotive repair quoting system with a React frontend and Node.js backend.

## Project Structure

- `client/` - React frontend with TypeScript and Tailwind CSS
- `server/` - Node.js backend with Express and TypeScript
- `docker-compose.yml` - Container orchestration for local development

## Deployment with Portainer

### Option 1: Using Docker Compose (Recommended)

1. In Portainer, go to Stacks → Add Stack
2. Set the following:
   - Name: `quoting-system`
   - Repository URL: `https://github.com/Obsidian2612/quoting_system.git`
   - Repository reference (branch/tag): `main`
   - Compose path: `docker-compose.yml`

3. Configure environment variables:
   ```env
   # Database
   POSTGRES_USER=your_db_user
   POSTGRES_PASSWORD=your_db_password
   POSTGRES_DB=quoting_system
   
   # Backend
   DATABASE_URL=postgresql://your_db_user:your_db_password@db:5432/quoting_system
   JWT_SECRET=your_jwt_secret
   
   # Frontend (if needed)
   VITE_API_URL=http://your-backend-url:4000
   ```

4. Click "Deploy the stack"

### Option 2: Manual Container Deployment

If you prefer to deploy containers individually:

1. Pull the images:
   ```bash
   docker pull ghcr.io/Obsidian2612/quoting_system/frontend:latest
   docker pull ghcr.io/Obsidian2612/quoting_system/backend:latest
   docker pull postgres:15
   ```

2. Create a network:
   ```bash
   docker network create quoting-system-net
   ```

3. Deploy PostgreSQL:
   ```bash
   docker run -d \
     --name quoting-system-db \
     --network quoting-system-net \
     -e POSTGRES_USER=your_db_user \
     -e POSTGRES_PASSWORD=your_db_password \
     -e POSTGRES_DB=quoting_system \
     -v quoting-system-db-data:/var/lib/postgresql/data \
     postgres:15
   ```

4. Deploy Backend:
   ```bash
   docker run -d \
     --name quoting-system-backend \
     --network quoting-system-net \
     -e DATABASE_URL=postgresql://your_db_user:your_db_password@quoting-system-db:5432/quoting_system \
     -e JWT_SECRET=your_jwt_secret \
     -p 4000:4000 \
     ghcr.io/Obsidian2612/quoting_system/backend:latest
   ```

5. Deploy Frontend:
   ```bash
   docker run -d \
     --name quoting-system-frontend \
     --network quoting-system-net \
     -p 80:80 \
     ghcr.io/Obsidian2612/quoting_system/frontend:latest
   ```

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token generation
- `PORT`: Server port (default: 4000)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL

## Development

To run locally:

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost
- Backend API: http://localhost:4000