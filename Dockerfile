FROM --platform=linux/amd64 node:20.2.0-slim as compiler

#RUN apt-get update && apt-get -y install git wget openssl

WORKDIR /app

#RUN git clone https://github.com/ajnart/homarr.git .
COPY . .

RUN yarn install
COPY .env.example .env
RUN yarn build


FROM node:20.2.0-alpine3.18

#ARGS is only for build

ARG PORT=7575

# Keep free id >= 1000 for user, under node:x image by default node user uses 1000:1000
ARG NODE_UID=800
ARG NODE_GID=800

#PUID can be set during build and run time
ARG PUID=801
ARG PGID=801

#it must be the same as the host, temporary 802 or any, automatically changed at runtime
ARG DOCKER_GID=802

#By default, ping group using gid 999, keep free to possible docker host gid
ARG PING_GID=803 

# Expose the default application port
EXPOSE $PORT
ENV PORT=${PORT}

# Define node.js environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV NODE_OPTIONS '--no-experimental-fetch'

# App environment variables
ENV DATABASE_URL "file:/data/db.sqlite"
ENV NEXTAUTH_URL "http://localhost:7575"
ENV NEXTAUTH_SECRET NOT_IN_USE_BECAUSE_JWTS_ARE_UNUSED

# Must be same as host user when using bind mount volumes
ENV PUID $PUID
ENV PGID $PGID

RUN apk update && apk add --no-cache \
    supervisor docker-cli shadow

RUN usermod -u $NODE_UID node
RUN groupmod -g $NODE_GID node

RUN groupmod -g $PING_GID ping

# Creating local homarr user and group
RUN groupadd -g $PGID homarr
RUN useradd homarr -u $PUID -g homarr --home-dir /app --shell /sbin/nologin
RUN usermod -aG node homarr

# Creating a local Docker group and add docker group to homarr user
RUN groupadd -g $DOCKER_GID docker
RUN usermod -aG docker homarr

# Enable sudo for homarr user, only for debug and testing purposes 
#RUN apk add sudo
#RUN echo "homarr ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Configure entrypoint
COPY ./docker/entrypoint /
RUN chmod +x /entrypoint.sh       
RUN chmod +x /docker-entrypoint.d/*.sh

# Configure supervisord
COPY ./docker/etc/supervisord.conf /etc/supervisord.conf
COPY ./docker/etc/supervisor /etc/supervisor

#RUN chown homarr:homarr /app 
USER node
WORKDIR /app

COPY --from=compiler --chown=node:homarr /app/next.config.js ./
COPY --from=compiler --chown=node:homarr /app/public ./public
COPY --from=compiler --chown=node:homarr /app/package.json ./temp_package.json
COPY --from=compiler --chown=node:homarr /app/yarn.lock ./temp_yarn.lock
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing

COPY --from=compiler --chown=node:homarr /app/.next/standalone ./
COPY --from=compiler --chown=node:homarr /app/.next/static ./.next/static

COPY --from=compiler --chown=node:homarr /app/scripts/run.sh ./scripts/run.sh
RUN chmod +x ./scripts/run.sh
COPY --from=compiler --chown=node:homarr /app/drizzle ./drizzle

COPY --from=compiler --chown=node:homarr /app/drizzle/migrate ./migrate
COPY --from=compiler --chown=node:homarr /app/tsconfig.json ./migrate/tsconfig.json
COPY --from=compiler --chown=node:homarr /app/cli ./cli

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

RUN cd /app/cli && yarn --immutable

# Root is needed for supervisord
USER root

RUN echo '#!/bin/bash\nnode /app/cli/cli.js "$@"' > /usr/bin/homarr
RUN chmod +x /usr/bin/homarr

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT} || exit 1

ENTRYPOINT [ "/entrypoint.sh" ]
CMD []
