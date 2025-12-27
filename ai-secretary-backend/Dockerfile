FROM node:20-alpine

WORKDIR /app

COPY ai-secretary-backend/package*.json ./
RUN npm install --production

COPY ai-secretary-backend/. .

EXPOSE 5003
CMD ["node", "src/server.js"]
