FROM node:16-alpine
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY /next.config.js ./
COPY  /public ./public
COPY /package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --chown=nextjs:nodejs /.next/standalone ./
COPY --chown=nextjs:nodejs /.next/static ./.next/static

USER nextjs
EXPOSE 7575
ENV PORT 7575
VOLUME /app/data/configs
CMD ["node", "server.js"]
