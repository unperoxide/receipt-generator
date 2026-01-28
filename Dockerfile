FROM ghcr.io/puppeteer/puppeteer:23.10.4

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY src ./src
COPY templates ./templates
COPY icons ./icons

EXPOSE 3000

CMD ["node", "src/server.js"]
