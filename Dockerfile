FROM node:20.5-slim
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
COPY ./drizzle ./drizzle
RUN mkdir /data
COPY ./src/migrate.ts ./src/migrate.ts

# Install dependencies
RUN apt-get update -y && apt-get install -y openssl wget

# Required for migration
RUN mv node_modules _node_modules
RUN rm package.json
RUN yarn add typescript ts-node dotenv drizzle-orm@0.28.6 better-sqlite3@8.6.0 @types/better-sqlite3
RUN mv node_modules node_modules_migrate
RUN mv _node_modules node_modules

# Expose the default application port
EXPOSE $PORT
ENV PORT=${PORT}

ENV DATABASE_URL "file:/data/db.sqlite"
ENV NEXTAUTH_URL "http://localhost:3000"
ENV PORT 7575
ENV NEXTAUTH_SECRET NOT_IN_USE_BECAUSE_JWTS_ARE_UNUSED

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT} || exit 1

CMD ["sh", "./scripts/run.sh"]
