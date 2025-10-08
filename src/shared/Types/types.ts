export interface UserProfile {
    name: string;
    ava: string
}

export interface Credentials{
    username: string;
    password: string;
}

export interface Profile {
    name: string;
    ava: string;
}

export interface Article {
    id: number;
    title: string;
    content: string;
    author: UserProfile;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
}