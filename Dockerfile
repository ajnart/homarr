FROM node:20.2.0-slim
WORKDIR /app

# Define node.js environment variables
ARG PORT=7575

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV NODE_OPTIONS '--no-experimental-fetch'

COPY next.config.js ./
COPY public ./public
COPY package.json ./temp_package.json
COPY yarn.lock ./temp_yarn.lock
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY ./scripts/run.sh ./scripts/run.sh
RUN chmod +x ./scripts/run.sh
COPY ./drizzle ./drizzle

COPY ./drizzle/migrate ./migrate
COPY ./tsconfig.json ./migrate/tsconfig.json
COPY ./cli ./cli

RUN mkdir /data

# Install dependencies
RUN apt update && apt install -y openssl wget

# Move node_modules to temp location to avoid overwriting
RUN mv node_modules _node_modules
RUN rm package.json
# Install dependencies for migration
RUN cp ./migrate/package.json ./package.json
RUN yarn
# Copy better_sqlite3 build for current platform
RUN cp /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node /app/_node_modules/better-sqlite3/build/Release/better_sqlite3.node
# Copy node_modules for migration to migrate folder for migration script
RUN mv node_modules ./migrate/node_modules

# Copy temp node_modules of app to app folder
RUN mv _node_modules node_modules

RUN echo '#!/bin/bash\nnode /app/cli/cli.js "$@"' > /usr/bin/homarr
RUN chmod +x /usr/bin/homarr
RUN cd /app/cli && yarn --immutable

# Expose the default application port
EXPOSE $PORT
ENV PORT=${PORT}

ENV DATABASE_URL "file:/data/db.sqlite"
ENV AUTH_TRUST_HOST="true"
ENV PORT 7575
ENV NEXTAUTH_SECRET NOT_IN_USE_BECAUSE_JWTS_ARE_UNUSED

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT} || exit 1

VOLUME [ "/app/data/configs" ]
VOLUME [ "/data" ]
ENTRYPOINT ["sh", "./scripts/run.sh"]