export interface Contact {
    id: string;
    username: string;
    avatar: string;
    badge?: {
        who: "you" | "it";
        status: "send" | "unread" | "read" | "miss-call";
        data?: number;
    };
}

export interface ContactList extends Array<Contact>{}

