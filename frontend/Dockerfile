@"
FROM python:3.13-slim

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend /app/backend

ENV PYTHONPATH=/app
EXPOSE 8000

CMD ["sh", "-c", "python -m backend.app.seed && uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"]
"@ | Set-Content -Path "backend\Dockerfile" -Encoding UTF8

@"
FROM nginx:alpine

COPY . /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
"@ | Set-Content -Path "frontend\Dockerfile" -Encoding UTF8

New-Item -ItemType Directory -Force -Path "infra" | Out-Null

@"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: calles_user
      POSTGRES_PASSWORD: calles_password
      POSTGRES_DB: calles_seguras
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ..
      dockerfile: backend/Dockerfile
    environment:
      DATABASE_URL: sqlite:///./calles_seguras.db
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build:
      context: ..
      dockerfile: frontend/Dockerfile
    ports:
      - "8080:80"
    depends_on:
      - backend

volumes:
  postgres_data:
"@ | Set-Content -Path "infra\docker-compose.yml" -Encoding UTF8