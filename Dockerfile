# Stage 1: Build TypeScript
FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm ci
RUN npm run build

# Stage 2: Create a smaller production image
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files from the previous stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm ci --production

EXPOSE 3000

CMD ["node", "./dist/server.js"]
