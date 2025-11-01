# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL and other build dependencies
RUN apk add --no-cache openssl openssl-dev libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["npm", "run", "start"]