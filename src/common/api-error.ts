import httpStatus from './http-status';

const codes = {
  // General codes
  NO_ERROR: 0x00,
  BAD_VALUE: 0x01,
  UNKNOWN_ERROR: 0xFF,
  // Authentication related
  UNAUTHORIZED: 0x10,
  USER_NOT_FOUND: 0x11,
};

class ErrorResponse {
  error: string;
  code: number;

  constructor(
    error: string = 'Unknown error',
    code: number = codes.UNKNOWN_ERROR,
  ) {
    this.error = error;
    this.code = code;
  }
}

class ApiError extends Error {
  code: number;
  status: number;

  constructor(
    message: string = 'Unknown error',
    code: number = codes.UNKNOWN_ERROR,
    httpCode: number = httpStatus.INTERNAL_SERVER_ERROR.code,
  ) {
    super(message);
    this.code = code;
    this.status = httpCode;
  }

  toErrorResponse(): ErrorResponse {
    return new ErrorResponse(this.message, this.code);
  }
}

export {
  codes,
  ErrorResponse,
  ApiError,
};
