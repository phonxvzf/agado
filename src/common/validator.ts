import { codes, ApiError } from './api-error';

const validGender = new Set(['Male', 'Female', 'Not specified', 'Prefer not to say']);
const validUserType = new Set(['traveler', 'hotel_manager', 'admin']);
const validPermitted = new Set(['no', 'req', 'pmt']);

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

  validateGender: (gender: string, errorMessage: string) => {
    if (validGender.has(gender)) return gender;
    throw new ApiError(errorMessage, codes.BAD_VALUE, 400);
  },

  validateUserType: (userType: string, errorMessage: string) => {
    if (validUserType.has(userType)) return userType;
    throw new ApiError(errorMessage, codes.BAD_VALUE, 400);
  },

  validateRating: (rating: string, errorMessage: string) => {
    if (rating == null) {
      return null;
    }

    const parse = validator.validateNumber(rating, errorMessage);
    if (parse < 0 || parse > 5) {
      throw new ApiError(errorMessage, codes.BAD_VALUE, 400);
    }
    return parse;
  },

  validatePermitted: (permitted: string, errorMessage: string) => {
    if (validPermitted.has(permitted)) {
      return permitted;
    }
    throw new ApiError(errorMessage, codes.BAD_VALUE, 400);
  },
};

export { validator, validGender, validUserType, validPermitted };
