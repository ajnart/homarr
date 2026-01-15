export class ResponseError extends Error {
  public readonly statusCode: number;
  public readonly url?: string;

  constructor(response: { status: number; url?: string }, options?: ErrorOptions) {
    super("Response did not indicate success", options);
    this.name = ResponseError.name;

    this.statusCode = response.status;
    this.url = response.url;
  }
}
