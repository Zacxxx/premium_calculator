export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public metadata?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "ApplicationError"
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", metadata)
    this.name = "ValidationError"
  }
}

export class CalculationError extends ApplicationError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, "CALCULATION_ERROR", metadata)
    this.name = "CalculationError"
  }
}

export function handleError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error
  }

  if (error instanceof Error) {
    return new ApplicationError(error.message, "UNKNOWN_ERROR", {
      originalError: error.name,
      stack: error.stack,
    })
  }

  return new ApplicationError("Une erreur inattendue est survenue", "UNKNOWN_ERROR", { originalError: error })
}

