export const Crypto = {
    async generateKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const baseKey = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        const saltBuffer = (new Uint8Array(salt)).buffer;

        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: saltBuffer,
                iterations: 250_000,
                hash: "SHA-256",
            },
            baseKey,
            {
                name: "AES-GCM",
                length: 256,
            },
            false,
            ["encrypt", "decrypt"]
        );
    },

    async encrypt(password: string, data: object): Promise<Blob> {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12)); 

        const key = await this.generateKey(password, salt);

        const encoded = new TextEncoder().encode(JSON.stringify(data));

        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoded
        );

        const blob = new Blob([salt, iv, encrypted]);

        return blob;
    },

    async decrypt(password: string, blob: Blob): Promise<any> {
        const buf = new Uint8Array(await blob.arrayBuffer());

        const salt = buf.slice(0, 16);
        const iv = buf.slice(16, 28);
        const encrypted = buf.slice(28);

        const key = await this.generateKey(password, salt);

        try {
            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                encrypted
            );

            const json = new TextDecoder().decode(decrypted);

            return JSON.parse(json);
        } catch {
            throw new Error("Senha incorreta ou arquivo inválido.");
        }
    }
};
