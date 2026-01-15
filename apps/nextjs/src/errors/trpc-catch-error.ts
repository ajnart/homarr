import "server-only";

import { notFound, redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";

import { createLogger } from "@homarr/core/infrastructure/logs";

const logger = createLogger({ module: "trpcCatchError" });

export const catchTrpcNotFound = (err: unknown) => {
  if (err instanceof TRPCError && err.code === "NOT_FOUND") {
    notFound();
  }

  throw err;
};

export const catchTrpcUnauthorized = (err: unknown) => {
  if (err instanceof TRPCError && err.code === "UNAUTHORIZED") {
    logger.info("Somebody tried to access a protected route without being authenticated, redirecting to login page");
    redirect("/auth/login");
  }

  throw err;
};
