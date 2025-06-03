FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

RUN npm install -g nodemon

EXPOSE 3000

CMD ["nodemon", "--legacy-watch", "server.js"]