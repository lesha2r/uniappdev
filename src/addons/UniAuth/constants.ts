export enum UniAuthTokenTypes {
    REFRESH = 'refresh',
    ACCESS = 'access',
}

export const COL_NAME_PREFIX_TOKENS = '_tokens';

export enum UniAuthTypes {
    EMAIL = 'email',
}

export enum UniAuthErrorMessages {
    INTERNAL_ERROR = 'Internal server error',
    FAILED_TO_SIGNIN_DURING_SIGNUP = 'Failed to signin created user',
    WRONG_PASSWORD = 'Wrong password',
    ALREADY_REGISTERED = 'Impossible to signup while already logged in',
    MISSING_UNI_AUTH = 'Missing __uniAuth object in request meta',
    MISSING_ACCESS_TOKEN = 'Missing access token',
    ACCESS_TOKEN_EXPIRED = 'Access token is expired',
    BAD_USER_ID = 'User ID in params does not match user ID in token',
    MONGO_DB_CLIENT_UNAVAILABLE = 'MongoDB client is not available',
    MIDDLEWARE_AUTH_ERROR = 'Middleware auth error',
}