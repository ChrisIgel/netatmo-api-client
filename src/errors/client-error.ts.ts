export class NetatmoClientInternalError extends Error {
  constructor(public readonly message: string, public readonly data: unknown) {
    super();
  }
}
