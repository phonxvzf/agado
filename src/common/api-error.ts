import httpStatus from './http-status';

const codes = {
  // General codes
  NO_ERROR: 0x00,
  BAD_VALUE: 0x01,
  NOT_IMPLEMENTED: 0x02,
  OBJECT_NOT_FOUND: 0x03,
  UNKNOWN_ERROR: 0xFF,
  // Authentication related
  UNAUTHORIZED: 0x10,
  USER_NOT_FOUND: 0x11,
  DEPRECATED_TOKEN: 0x12,
  DUPLICATE_USER: 0x13,
  // Hotel related
  HOTEL_NOT_FOUND: 0x21,
  DUPLICATE_HOTEL: 0x23,
  // Hotel manager related
  HOTEL_MANAGER_NOT_FOUND: 0x31,
  DUPLICATE_HOTEL_MANAGER: 0x33,
  // Request related
  REQUEST_NOT_FOUND: 0x41,
  // Reservation related
  RESERVATION_NOT_FOUND: 0x51,
  // Review related
  REVIEW_NOT_FOUND: 0x61,
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
