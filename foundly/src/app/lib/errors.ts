export class AppError extends Error {
  public readonly isOperational: boolean;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

export class LimitError extends AppError {
  constructor(message: string) {
    super(message);
  }
}
