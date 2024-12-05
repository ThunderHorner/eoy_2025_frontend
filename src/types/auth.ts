export interface UserCredentials {
    username: string;
    password: string;
}

export interface RegisterData extends UserCredentials {
    email?: string;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}
