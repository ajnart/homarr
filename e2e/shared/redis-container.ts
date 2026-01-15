import { RedisContainer } from "@testcontainers/redis";

export const createRedisContainer = () => {
  return new RedisContainer("redis:latest").withPassword("homarr");
};
