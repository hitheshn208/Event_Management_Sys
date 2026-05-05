FROM node:18-alpine AS base

RUN apk update && apk upgrade

WORKDIR /app

COPY package*.json ./
RUN rm -rf node_modules/

RUN npm install
COPY . .

RUN adduser -D -h /home/appuser -s /usr/bin/sh appuser
RUN chown -R appuser:appuser ./

USER appuser
EXPOSE 3000

CMD ["node", "app.js"]
