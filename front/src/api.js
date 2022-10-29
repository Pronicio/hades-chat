const api = {
    async createKeys() {
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
    async exportKeys(key) {
        const keyData = await window.crypto.subtle.exportKey("jwk", key)
        return JSON.stringify(keyData, null, " ");
    },
    importKey(key, name) {
        const usage = name === "public" ? "encrypt" : "decrypt"
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
    async encrypt(message, publicKey) {
        const enc = new TextEncoder();
        const data = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            publicKey,
            enc.encode(message)
        )
        return this._arrayBufferToBase64(data)
    },
    async decrypt(message, privateKey) {
        const msg = this._base64ToArrayBuffer(message)
        const data = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            msg
        );
        const enc = new TextDecoder("utf-8");
        return enc.decode(data);
    },

    _arrayBufferToBase64(buffer) {
        let binary = ''
        const bytes = new Uint8Array(buffer)
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    },
    _base64ToArrayBuffer(base64) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

export { api }
