FROM node:16.15.0-alpine3.15 as build

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install
COPY . .
RUN yarn export

FROM nginx:1.21.6
COPY --from=build /app/out /usr/share/nginx/html
