export interface Logger {
  log: (message: string) => void;
  error: (message: string) => void;
}

export class DefaultLogger {
  public log(msg: string): void {
    console.log(msg);
  }

  public error(msg: string): void {
    console.error(msg);
  }
}
