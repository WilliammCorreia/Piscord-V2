FROM node:24.15.0-alpine3.22 AS base
WORKDIR /app

COPY package*.json ./

# Development
FROM base AS dev

RUN npm ci

COPY . .

CMD [ "npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "1000" ]

# Build
FROM base AS build

RUN npm ci

COPY . .

RUN npx ng build --configuration=production

# Production
FROM nginx:1.30.0-alpine3.23-slim AS prod

COPY config.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 4200