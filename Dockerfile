# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.2.2
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV ENV="prod"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
# RUN apt-get update -qq && \
#   apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

# Copy application code
COPY . .
RUN bun install --ci
RUN bun run --filter=@job-seekr/api build
RUN bun run --filter=@job-seekr/web-client build
RUN bun run --filter=@job-seekr/data build

# Remove unnecessary stuff
RUN rm -rf ./packages
RUN rm -rf ./node_modules

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app
WORKDIR /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "run", "start" ]
