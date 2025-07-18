FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build avec le chemin de sortie explicite
RUN npm run build:prod

FROM nginx:alpine

# Copier les fichiers buildés depuis le dossier browser (Angular 20+)
COPY --from=builder /app/dist/browser/ /usr/share/nginx/html/

# Copier la configuration nginx
COPY nginx-local.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]