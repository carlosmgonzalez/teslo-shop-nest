<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Teslo API

## Description

API for Teslo application. This API is built with NestJS and TypeORM.

## Environment Variables

```bash
# Database
cp .env.template .env
```

## Up database with Docker

```bash
docker compose up -d
```

## Installation

```bash
npm install
```

## Execut seed

```
http://localhost:3000/api/seed
```

## Running the app

```bash
# development
npm run start:dev
```

## Production build docker

1. Create .env.prod file

2. Create a Dockerfile file

3. Create docker-compose.prod.yml file

4. Build the image

```bash
docker commpose -f docker-compose.prod.yaml --env-file .env.prod up --build
```

5. Run the container

```bash
docker commpose -f docker-compose.prod.yaml --env-file .env.prod up -d
```

6. Stop the container

```bash
docker commpose -f docker-compose.prod.yaml --env-file .env.prod down
```
