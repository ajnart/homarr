FROM node:20-alpine
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV NODE_OPTIONS '--no-experimental-fetch'

COPY next.config.js ./
COPY public ./public
COPY package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY .next/standalone ./
COPY .next/static ./.next/static

COPY prisma/schema.prisma prisma/schema.prisma

COPY ./scripts/run.sh ./scripts/run.sh

EXPOSE 7575
RUN npm i -g prisma
ENV PORT 7575
ENV NEXTAUTH_SECRET NOT_IN_USE_BECAUSE_JWTS_ARE_UNUSED

CMD ["sh", "./scripts/run.sh"]
