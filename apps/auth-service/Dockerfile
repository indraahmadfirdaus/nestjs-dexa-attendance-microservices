FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copy source
COPY apps/auth-service ./apps/auth-service
COPY libs ./libs
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Generate Prisma clients
RUN npx prisma generate --schema=./prisma/main/schema.prisma

# Build
RUN npm run build:auth

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3001

# Start
CMD ["node", "dist/apps/auth-service/main"]