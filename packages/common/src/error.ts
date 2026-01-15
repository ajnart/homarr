export const extractErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
};

export abstract class FlattenError extends Error {
  constructor(
    message: string,
    private flattenResult: Record<string, unknown>,
  ) {
    super(message);
  }

  public flatten(): Record<string, unknown> {
    return this.flattenResult;
  }
}
