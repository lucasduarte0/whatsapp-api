# Base Stage: Set up the base environment with Node.js and necessary packages
FROM node:20-alpine AS base

# Set environment variables for Chromium and Node.js
ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true" \
    NODE_ENV="production"

# Install system dependencies, including Chromium and gcompat
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
        udev \
        ttf-freefont \
        chromium \
        gcompat

# Builder Stage: Install dependencies and build the application
FROM base AS builder

# Set the working directory
WORKDIR /app

# Copy package.json, package-lock.json, tsconfig.json, and source code
COPY package*.json tsconfig.json src ./

# Install dependencies, build the project, and prune dev dependencies
RUN npm ci && \
    npm run build && \
    npm prune --production

# Runner Stage: Prepare the final lightweight image
FROM base AS runner

# Set the working directory
WORKDIR /app

# Create a non-root user for running the application
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

# Copy the built application and necessary files from the builder stage
COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

# Switch to the non-root user
USER hono

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD ["node", "/app/dist/index.js"]