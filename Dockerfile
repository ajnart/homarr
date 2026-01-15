FROM node:24.12.0-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory
WORKDIR /app
RUN apk add --no-cache libc6-compat curl bash
RUN apk update
COPY . .

RUN corepack enable pnpm && pnpm install --recursive --frozen-lockfile

# Copy static data as it is not part of the build
COPY static-data ./static-data
ARG SKIP_ENV_VALIDATION='true'
ARG CI='true'
ARG DISABLE_REDIS_LOGS='true'

RUN corepack enable pnpm && pnpm build

FROM base AS runner
WORKDIR /app

# gettext is required for envsubst, openssl for generating AUTH_SECRET, su-exec for running application as non-root
RUN apk add --no-cache redis nginx bash gettext su-exec openssl
RUN mkdir /appdata
VOLUME /appdata

# Enable homarr cli
COPY --from=builder /app/packages/cli/cli.cjs /app/apps/cli/cli.cjs
RUN echo $'#!/bin/bash\ncd /app/apps/cli && node ./cli.cjs "$@"' > /usr/bin/homarr
RUN chmod +x /usr/bin/homarr

# Don't run production as root
RUN mkdir -p /var/cache/nginx && \
    mkdir -p /var/log/nginx && \
    mkdir -p /var/lib/nginx && \
    touch /run/nginx/nginx.pid && \
    mkdir -p /etc/nginx/templates /etc/nginx/ssl/certs

COPY --from=builder /app/apps/nextjs/next.config.ts .
COPY --from=builder /app/apps/nextjs/package.json .

COPY --from=builder /app/apps/tasks/tasks.cjs ./apps/tasks/tasks.cjs
COPY --from=builder /app/apps/websocket/wssServer.cjs ./apps/websocket/wssServer.cjs
COPY --from=builder /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node /app/build/better_sqlite3.node

COPY --from=builder /app/packages/db/migrations ./db/migrations

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/apps/nextjs/.next/standalone ./
COPY --from=builder /app/apps/nextjs/.next/static ./apps/nextjs/.next/static
COPY --from=builder /app/apps/nextjs/public ./apps/nextjs/public
COPY scripts/run.sh ./run.sh
COPY --chmod=755 scripts/entrypoint.sh ./entrypoint.sh
COPY packages/redis/redis.conf /app/redis.conf
COPY nginx.conf /etc/nginx/templates/nginx.conf


ENV DB_URL='/appdata/db/db.sqlite'
ENV DB_DIALECT='sqlite'
ENV DB_DRIVER='better-sqlite3'
ENV AUTH_PROVIDERS='credentials'
ENV REDIS_IS_EXTERNAL='false'
ENV NODE_ENV='production'

ENTRYPOINT [ "/app/entrypoint.sh" ]
CMD ["sh", "run.sh"]
