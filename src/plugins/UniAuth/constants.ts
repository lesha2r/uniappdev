export enum UniAuthTokenTypes {
    REFRESH = 'refresh',
    ACCESS = 'access',
}

export enum UniAuthErrorMessages {
    INTERNAL_ERROR = 'Internal server error',
    FAILED_TO_SIGNIN_DURING_SIGNUP = 'Failed to signin created user',
    WRONG_PASSWORD = 'Wrong password',
    MISSING_UNI_AUTH = 'Missing __uniAuth object in request meta',
    MISSING_ACCESS_TOKEN = 'Missing access token',
    BAD_USER_ID = 'User ID in params does not match user ID in token',
    MONGO_DB_CLIENT_UNAVAILABLE = 'MongoDB client is not available',
}