# Base image
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
# Install all dependencies including devDependencies
RUN npm install
# Copy the rest of the application code
COPY . .
EXPOSE 8000
# Run the application in development mode with nodemon (as defined in package.json)
CMD ["npm", "run", "dev"]

# Production builder stage
FROM base AS builder
RUN npm ci
COPY . .
# If there was a build step (like TypeScript), it would go here
# RUN npm run build

# Production final stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production
# Copy application code (or build output if applicable)
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
