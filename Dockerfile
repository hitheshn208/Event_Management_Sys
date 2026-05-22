FROM node:22-alpine AS base

RUN apk update && apk upgrade

WORKDIR /app

RUN adduser -D -h /home/appuser -s /usr/bin/sh appuser

COPY --chown=appuser:appuser package.json package-lock.json ./
RUN npm ci --only=production --omit=dev

COPY --chown=appuser:appuser . ./

USER appuser

EXPOSE 3000

CMD ["node", "app"]
