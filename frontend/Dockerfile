FROM node:24.15.0-alpine3.22 AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Dev : serveur de développement Angular, les sources sont montées en volume
FROM base AS dev

EXPOSE 4200

CMD [ "npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "1000" ]

# Build : compilation de production
FROM base AS build

COPY . .

RUN npx ng build

# Prod : fichiers statiques servis par nginx (plus de Node ni de serveur de dev)
FROM nginx:1.28-alpine AS prod

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Même port qu'en dev : la configuration du reverse proxy est identique dans les deux cas
EXPOSE 4200
