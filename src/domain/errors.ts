export class AppError extends Error {
	public readonly code: string;
	public readonly httpStatus: number;
	public readonly details?: unknown;

	constructor(code: string, message: string, httpStatus = 500, details?: unknown) {
		super(message);
		this.name = 'AppError';
		this.code = code;
		this.httpStatus = httpStatus;
		this.details = details;
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: unknown) {
		super('VALIDATION_ERROR', message, 400, details);
		this.name = 'ValidationError';
	}
}

export class ProviderError extends AppError {
	constructor(message: string, details?: unknown, status = 502) {
		super('PROVIDER_ERROR', message, status, details);
		this.name = 'ProviderError';
	}
}

export class RateLimitError extends AppError {
	constructor(message = 'Rate limit exceeded', details?: unknown) {
		super('RATE_LIMIT', message, 429, details);
		this.name = 'RateLimitError';
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Not found', details?: unknown) {
		super('NOT_FOUND', message, 404, details);
		this.name = 'NotFoundError';
	}
}

export class ConfigError extends AppError {
	constructor(message: string, details?: unknown) {
		super('CONFIG_ERROR', message, 500, details);
		this.name = 'ConfigError';
	}
}

export function toHttpResponse(error: unknown): { status: number; body: { error: string; code: string } } {
	if (error instanceof AppError) {
		return { status: error.httpStatus, body: { error: error.message, code: error.code } };
	}
	return { status: 500, body: { error: 'Internal Server Error', code: 'INTERNAL' } };
}


