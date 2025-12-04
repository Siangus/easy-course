export interface EncryptedData {
    content: string;
    iv: string;
    tag: string;
}
export declare function encryptCredentials(credentials: string): EncryptedData;
export declare function decryptCredentials(encrypted: string, iv: string, tag: string): string;
//# sourceMappingURL=encryption.service.d.ts.map