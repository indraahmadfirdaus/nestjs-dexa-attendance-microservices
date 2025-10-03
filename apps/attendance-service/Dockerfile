FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

COPY apps/attendance-service ./apps/attendance-service
COPY libs ./libs
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate --schema=./prisma/main/schema.prisma
RUN npm run build attendance:service

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3004

CMD ["node", "dist/apps/attendance-service/main"]