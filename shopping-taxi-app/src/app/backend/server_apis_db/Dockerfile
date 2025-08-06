FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install || true
CMD ["node", "server.ts"]
