import React from 'react';

export type Role = 'guest' | 'member' | 'admin' | 'pastor';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
    joinedAt?: string;
    lastLogin?: string;
    status?: 'active' | 'inactive';
    phone?: string;
    address?: string;
    bio?: string;
}

export interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    roles: Role[]; // Who can see this?
}

export interface Sermon {
    id: string;
    title: string;
    speaker: string;
    date: string;
    category: string;
    imageUrl: string;
    videoUrl?: string;
}

export interface Ministry {
    id: string;
    name: string;
    description: string;
    icon: string;
    imageUrl: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    category: string;
    imageUrl: string;
    comments: BlogComment[];
}

export interface BlogComment {
    id: string;
    user: string;
    text: string;
    date: string;
}

export interface ChurchEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl: string;
    category: string;
}
