import { useMemo } from "react";
import { IconExclamationCircle, IconShield } from "@tabler/icons-react";
import { TRPCClientError } from "@trpc/client";
import type { DefaultErrorData } from "@trpc/server/unstable-core-do-not-import";

import type { WidgetKind } from "@homarr/definitions";

import type { WidgetDefinition } from "..";
import { widgetImports } from "..";
import { ErrorBoundaryError } from "./base";
import type { BaseWidgetErrorProps } from "./base-component";
import { BaseWidgetError } from "./base-component";

interface WidgetErrorProps {
  kind: WidgetKind;
  error: unknown;
  resetErrorBoundary: () => void;
}

export const WidgetError = ({ error, resetErrorBoundary, kind }: WidgetErrorProps) => {
  const currentDefinition = useMemo(() => widgetImports[kind].definition, [kind]);

  if (error instanceof ErrorBoundaryError) {
    return <BaseWidgetError {...error.getErrorBoundaryData()} onRetry={resetErrorBoundary} />;
  }

  const widgetTrpcErrorData = handleWidgetTrpcError(error, currentDefinition);
  if (widgetTrpcErrorData) {
    return <BaseWidgetError {...widgetTrpcErrorData} onRetry={resetErrorBoundary} />;
  }

  const trpcErrorData = handleCommonTrpcError(error);
  if (trpcErrorData) {
    return <BaseWidgetError {...trpcErrorData} onRetry={resetErrorBoundary} />;
  }

  return (
    <BaseWidgetError
      icon={IconExclamationCircle}
      message={(error as { toString: () => string }).toString()}
      onRetry={resetErrorBoundary}
    />
  );
};

const handleWidgetTrpcError = (
  error: unknown,
  currentDefinition: WidgetDefinition,
): Omit<BaseWidgetErrorProps, "onRetry"> | null => {
  if (!(error instanceof TRPCClientError && "code" in error.data)) return null;

  const errorData = error.data as DefaultErrorData;

  if (!("errors" in currentDefinition) || currentDefinition.errors === undefined) return null;

  const errors: Exclude<WidgetDefinition["errors"], undefined> = currentDefinition.errors;
  const errorDefinition = errors[errorData.code];

  if (!errorDefinition) return null;

  return {
    ...errorDefinition,
    showLogsLink: !errorDefinition.hideLogsLink,
  };
};

const handleCommonTrpcError = (error: unknown): Omit<BaseWidgetErrorProps, "onRetry"> | null => {
  if (!(error instanceof TRPCClientError && "code" in error.data)) return null;

  const errorData = error.data as DefaultErrorData;

  if (errorData.code === "UNAUTHORIZED" || errorData.code === "FORBIDDEN") {
    return {
      icon: IconShield,
      message: "You don't have permission to access this widget",
      showLogsLink: false,
    };
  }

  return null;
};
