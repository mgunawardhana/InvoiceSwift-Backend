export interface User {
    uid: string;
    email: string;
    displayName?: string;
    role: string;
    createdAt: Date;
    phoneNumber?: string;
}