const config = {
    maxLoginsPerUser: 3,
    authNameDefault: 'uniauth',
    authTypeDefault: 'email',
    jwtDefaults: {
        accessToken: {
            expiresIn: '30m',
        },
        refreshToken: {
            expiresIn: '30d',
        },
    }
}

export default config