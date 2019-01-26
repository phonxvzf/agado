import { codes, ApiError } from './api-error';

const validator = {
  validateUndefined: (str: string, errorMessage: string) => {
    if (str == null) {
      throw new ApiError(errorMessage, codes.BAD_VALUE, 400);
    }
    return str;
  },

  validateId: (id: string, errorMessage: string = 'invalid id') => {
    const parse = Number.parseInt(id, 10);
    if (Number.isNaN(parse) || parse < 1) {
      throw new ApiError(errorMessage, codes.BAD_VALUE, 400);
    }
    return parse;
  },

  validateNumber: (n: string, errorMessage: string) => {
    const parse = Number.parseFloat(n);
    if (Number.isNaN(parse)) {
      throw new ApiError(errorMessage, codes.BAD_VALUE, 400);
    }
    return parse;
  },

  validateNumBool: (n: string, errorMessage: string) => {
    const parse = Number.parseInt(n, 10);
    if (Number.isNaN(parse) || parse > 1 || parse < 0) {
      throw new ApiError(errorMessage, codes.BAD_VALUE, 400);
    }
    return parse;
  },
};

export default validator;
