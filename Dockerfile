FROM node:20.5-slim
WORKDIR /app

# Define node.js environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV NODE_OPTIONS '--no-experimental-fetch'

COPY next.config.js ./
COPY public ./public
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY prisma/schema.prisma prisma/schema.prisma
COPY ./scripts/run.sh ./scripts/run.sh

# Install dependencies
RUN apt-get update -y && apt-get install -y openssl
RUN yarn global add prisma

# Expose the default application port
EXPOSE 7575

ENV PORT 7575
ENV NEXTAUTH_SECRET NOT_IN_USE_BECAUSE_JWTS_ARE_UNUSED

CMD ["sh", "./scripts/run.sh"]
