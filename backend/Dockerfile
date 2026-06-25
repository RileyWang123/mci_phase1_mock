FROM node:20-alpine

# ffprobe (from ffmpeg) reads authoritative video duration for process-time scaling.
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "start"]
