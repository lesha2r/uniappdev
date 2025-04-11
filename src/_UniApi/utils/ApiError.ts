class ApiError extends Error {
    code: number;

    constructor(code = 200, message?: string, options?: any) {
        // @ts-ignore
        super(message, options);
        this.code = code;
    }
}

export default ApiError;