type Format = "pkcs8" | "spki";

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
            privateKey: await this.exportKeys(privateKey, "pkcs8"),
            publicKey: await this.exportKeys(publicKey, "spki")
        }
    },

    async exportKeys(key: CryptoKey, format: Format): Promise<string> {
        const exported: ArrayBuffer = await window.crypto.subtle.exportKey(format, key);
        return window.btoa(this._ab2str(exported))
    },

    async importKey(data: any, type: KeyType): Promise<CryptoKey> {
        const usage: KeyUsage = type === "public" ? "encrypt" : "decrypt";
        const format: KeyFormat = type === "public" ? "spki" : "pkcs8"

        const binaryDerString = window.atob(data);
        const binaryDer = this._str2ab(binaryDerString);

        return window.crypto.subtle.importKey(
            format,
            binaryDer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            [ usage ]
        )
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
