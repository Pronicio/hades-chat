export interface Contact {
    id: string;
    username: string;
    avatar: string;
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

