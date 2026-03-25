export interface ApiResponse<T> {
    data: T;
    errCode: string | null;
    errCodeMsg: string | null;
    httpCode: number;
    message: string;
    resultCode: string;
    timestamp: string;
}
