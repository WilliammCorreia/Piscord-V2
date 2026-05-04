FROM node:24.15.0-alpine3.22 AS base
WORKDIR /app

COPY package*.json ./

# Dev
FROM base AS dev

RUN npm ci

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Prod
FROM base AS prod

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

USER node

CMD ["node", "server.js"]