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

export interface ArticleShort {
    id: number;
    title: string;
    previewImg: string;
}

export interface Article {
    id: number;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
}

export interface ContentBlock {
  type: string;
  content: any;
}

export interface MainInfo {
  name?: string;
  image?: string;
  age?: number;
  birthday?: string;
  gender?: string;
  appearance?: string;
  height?: string;
  weight?: string;
  other?: Record<string, any>;
}

export interface ArticleCreate {
  title: string;
  previewImg: string;
  mainInfo: MainInfo;
  mainContent: ContentBlock[];
}

export interface Article {
  id: number;
  title: string;
  previewImg: string;
  author: string; // имя автора, не объект
  mainInfo: MainInfo;
  mainContent: ContentBlock[];
}