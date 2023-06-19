export interface Contact {
    username: string;
    avatar: string;
    publicKey: string;
    lastTime: {
        message: string;
        time: string;
    };
    badge: {
        status: "send" | "unread" | "read" | "miss-call";
        data?: number;
    };
    active: boolean;
}

export interface ContactList extends Array<Contact>{}

