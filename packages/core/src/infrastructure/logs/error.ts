export class ErrorWithMetadata extends Error {
  public metadata: Record<string, unknown>;

  constructor(message: string, metadata: Record<string, unknown> = {}, options?: ErrorOptions) {
    super(message, options);
    this.name = "Error";
    this.metadata = metadata;
  }
}
