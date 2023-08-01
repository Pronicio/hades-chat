export interface Contact {
    username: string;
    avatar: string;
    publicKey: string;
    lastTime: {
        message: string;
        time: string;
    };
    badge: {
        status: "send" | "unread" | "read" | "miss-call" | null;
        data?: number;
    };
    active: boolean;
}

export interface ContactList extends Array<Contact>{}

export interface Message {
    username: string | "me";
    content: string;
    date: Date;
}

export interface MessageList extends Array<Message>{}
