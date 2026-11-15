FROM node:24.15.0-alpine3.22 AS base
WORKDIR /app

COPY package*.json ./

# Dev : les sources sont montées en volume et Node exécute le TypeScript directement
FROM base AS dev

RUN npm ci

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Build : compile le TypeScript en JavaScript
FROM base AS build

RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm run build

# Prod : uniquement les dépendances de production et le JavaScript compilé
FROM base AS prod

ENV NODE_ENV=production

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

USER node

CMD ["node", "dist/server.js"]
