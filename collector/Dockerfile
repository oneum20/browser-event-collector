# browser-event-collector — HTTP API → NDJSON file or stdout (Fluent Bit tail)
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV OUTPUT_MODE=file
ENV OUTPUT_DIR=/app/logs
ENV OUTPUT_FILE=browser-events.ndjson

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY server.js ./

RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

USER nodejs

EXPOSE 8080

VOLUME ["/app/logs"]

CMD ["node", "server.js"]
