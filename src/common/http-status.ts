class HttpStatus {
  code: number;
  message: string;

  constructor(code: number, message: string = 'Undefined') {
    this.code = code;
    this.message = message;
  }
}

const status = {
  OK: new HttpStatus(200),
  CREATED: new HttpStatus(201, 'Created'),
  ACCEPTED: new HttpStatus(202, 'Accepted'),
  NO_CONTENT: new HttpStatus(204, 'No Content'),
  RESET_CONTENT: new HttpStatus(205),
  PARTIAL_CONTENT: new HttpStatus(206),
  MULTIPLE_CHOICES: new HttpStatus(300),
  MOVED_PERMANENTLY: new HttpStatus(301),
  FOUND: new HttpStatus(302),
  SEE_OTHER: new HttpStatus(303),
  NOT_MODIFIED: new HttpStatus(304),
  USE_PROXY: new HttpStatus(305),
  SWITCH_PROXY: new HttpStatus(306),
  TEMPORARY_REDIRECT: new HttpStatus(307),
  PERMANENT_REDIRECT: new HttpStatus(308),
  BAD_REQUEST: new HttpStatus(400, 'Invalid Body'),
  UNAUTHORIZED: new HttpStatus(401, 'Unauthorized Request'),
  PAYMENT_REQUIRED: new HttpStatus(402, 'Payment Required'),
  FORBIDDEN: new HttpStatus(403, 'Fobidden'),
  NOT_FOUND: new HttpStatus(404, 'Resource Not Found'),
  METHOD_NOT_ALLOWED: new HttpStatus(405),
  NOT_ACCEPTABLE: new HttpStatus(406),
  PROXY_AUTH_REQUIRED: new HttpStatus(407),
  REQUEST_TIMEOUT: new HttpStatus(408),
  PAYLOAD_TOO_LARGE: new HttpStatus(413),
  URI_TOO_LONG: new HttpStatus(414, 'URI Too Long'),
  UNSUPPORTED_MEDIA_TYPE: new HttpStatus(415),
  TOO_MANY_REQUEST: new HttpStatus(429),
  INTERNAL_SERVER_ERROR: new HttpStatus(500, 'Unknown Internal Server Error'),
  NOT_IMPLEMENTED: new HttpStatus(501, 'Not implemented'),
  BAD_GATEWAY: new HttpStatus(502),
  SERVICE_UNAVAILABLE: new HttpStatus(503, 'Service unavailable'),
  GATEWAY_TIMEOUT: new HttpStatus(504),
  HTTP_VERSION_NOT_SUPPORTED: new HttpStatus(505),
  LOOP_DETECTED: new HttpStatus(508),
};

export default status;
