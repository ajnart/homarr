FROM node:24.12.0-trixie AS base
WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .
RUN corepack enable pnpm && pnpm install --frozen-lockfile
CMD ["sleep", "60s"]