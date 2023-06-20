const cryptoApi: any = {
    async createKeys(): Promise<{ privateKey: string, publicKey: string }> {
        const { privateKey, publicKey } = await window.crypto.subtle.generateKey({
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([ 1, 0, 1 ]),
                hash: { name: "SHA-256" },
            },
            true,
            [ "encrypt", "decrypt" ]
        )

        return {
            privateKey: await this.exportKeys(privateKey),
            publicKey: await this.exportKeys(publicKey)
        }
    },

    async exportKeys(key: CryptoKey): Promise<string> {
        const keyData = await window.crypto.subtle.exportKey("jwk", key)
        return window.btoa(JSON.stringify(keyData, null, " "))
    },

    async importKey(data: string, type: KeyType): Promise<CryptoKey> {
        const usage: KeyUsage = type === "public" ? "encrypt" : "decrypt";

        const key = window.atob(data);
        const jwk = JSON.parse(key)

        return window.crypto.subtle.importKey(
            "jwk",
            jwk,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            [ usage ]
        );
    },

    async encrypt(message: string, publicKey: CryptoKey) {
        const enc = new TextEncoder();
        const data = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            publicKey,
            enc.encode(message)
        )
        return this._ab2str(data)
    },

    async decrypt(message: string, privateKey: CryptoKey) {
        const msg = this._str2ab(message)
        const data = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            msg
        );
        const enc = new TextDecoder("utf-8");
        return enc.decode(data);
    },

    _ab2str(buf: ArrayBuffer): string {
        return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
    },

    _str2ab(str: string): ArrayBuffer {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);

        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }

        return buf;
    }
}

export { cryptoApi }

export function getDate(time: string) {
    if (!time) return
    const date = new Date(parseInt(time));

    const today = new Date()
    const isToday = date.getDate() == today.getDate()
        && date.getMonth() == today.getMonth()
        && date.getFullYear() == today.getFullYear();

    if (isToday) {
        return `${date.getHours()}:${date.getMinutes()}`
    }

    return `${date.getDay()}/${date.getMonth()}`
}
