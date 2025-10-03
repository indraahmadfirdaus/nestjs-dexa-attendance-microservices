FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

COPY apps/employee-service ./apps/employee-service
COPY libs ./libs
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate --schema=./prisma/main/schema.prisma
RUN npm run build:employee

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3002

CMD ["node", "dist/apps/employee-service/main"]