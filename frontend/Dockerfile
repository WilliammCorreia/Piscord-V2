FROM node:22-alpine

WORKDIR /app

RUN npm install -g @angular/cli

COPY package*.json ./
RUN npm ci

COPY . .

CMD [ "ng", "serve", "--host", "0.0.0.0", "--poll", "1000" ]