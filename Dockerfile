FROM node:16-alpine
WORKDIR /app
ENV NODE_ENV production
COPY /next.config.js ./
COPY /public ./public
COPY /package.json ./package.json
# Automatically leverage output traces to reduce image size. https://nextjs.org/docs/advanced-features/output-file-tracing
COPY /.next/standalone ./
COPY /.next/static ./.next/static
EXPOSE 7575
ENV PORT 7575
RUN apk add tzdata
VOLUME /app/data/configs
CMD ["node", "server.js"]
