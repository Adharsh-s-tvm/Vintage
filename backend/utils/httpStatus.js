/**
 * HTTP Status Codes as constants
 */
export const HttpStatus = {
    // Success codes
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,

    // Client error codes
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,

    // Server error codes
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};