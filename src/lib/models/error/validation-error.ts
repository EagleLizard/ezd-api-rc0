
export class ValidationError extends Error {
  public code: string;
  constructor(
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'EZD.1';
  }
}
