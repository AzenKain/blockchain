import { pbkdf2Sync, createCipheriv, createDecipheriv } from 'crypto';

export class ExtensionMethods {
    static If<T>(v: T, predicate: (v: T) => boolean, action: (v: T) => void): boolean {
        const ret = predicate(v);
        if (ret) action(v);
        return ret;
    }

    static IfBool(b: boolean, action: () => void): boolean {
        if (b) action();
        return b;
    }

    static IfElse(b: boolean, ifTrue: () => void, ifFalse: () => void): void {
        if (b) {
            ifTrue();
        } else {
            ifFalse();
        }
    }

    static Is<T>(obj: unknown, action: (v: T) => void): boolean {
        if (obj instanceof Object) {
            action(obj as T);
            return true;
        }
        return false;
    }

    static IfTrue<T>(obj: T, test: (obj: T) => boolean, action: (obj: T) => void): void {
        if (test(obj)) action(obj);
    }

    static IfNull<T>(obj: T | null | undefined): boolean {
        return obj === null || obj === undefined;
    }

    static IfNullAction<T>(obj: T | null | undefined, action: () => void): boolean {
        if (obj === null || obj === undefined) {
            action();
            return true;
        }
        return false;
    }

    static IfNotNull<T>(obj: T | null | undefined): boolean {
        return obj !== null && obj !== undefined;
    }

    static IfNotNullReturn<T, R>(obj: T | null | undefined, func: (obj: T) => R): R | undefined {
        return obj !== null && obj !== undefined ? func(obj) : undefined;
    }

    static ElseIfNullReturn<T, R>(obj: T | null | undefined, func: () => R): R | undefined {
        return obj === null || obj === undefined ? func() : undefined;
    }

    static IfNotNullAction<T>(obj: T | null | undefined, action: (obj: T) => void): boolean {
        if (obj !== null && obj !== undefined) {
            action(obj);
            return true;
        }
        return false;
    }

    static IfNotNullWithDefault<T, R>(obj: T | null | undefined, defaultValue: R, func: (obj: T) => R): R {
        return obj !== null && obj !== undefined ? func(obj) : defaultValue;
    }

    static then(b: boolean, f: () => void): boolean {
        if (b) f();
        return b;
    }

    static else(b: boolean, f: () => void): void {
        if (!b) f();
    }

    static keyFromValue<TKey, TValue>(dict: Map<TKey, TValue>, val: TValue): TKey | undefined {
        for (const [key, value] of dict.entries()) {
            if (value === val) return key;
        }
        throw new Error("Collection does not contain item in qualifier.");
    }

    static forEach<T>(collection: T[], action: (item: T) => void): void {
        collection.forEach(action);
    }

    static forEachWithIndex<T>(collection: T[], action: (item: T, index: number) => void): void {
        collection.forEach(action);
    }

    static single<T>(collection: T[], predicate: (item: T) => boolean): T {
        for (const item of collection) {
            if (predicate(item)) return item;
        }
        throw new Error("Collection does not contain item in qualifier.");
    }

    static containsClass<T>(collection: T[], predicate: (item: T) => boolean): boolean {
        return collection.some(predicate);
    }

    static singleOrDefault<T>(collection: T[], predicate: (item: T) => boolean): T | undefined {
        return collection.find(predicate);
    }

    static merge<T, U>(dict1: Map<T, U>, dict2: Map<T, U>): Map<T, U> {
        return new Map([...dict1, ...dict2]);
    }

    static removeDuplicates<T>(source: T[], comparator: (a: T, b: T) => boolean): T[] {
        return source.filter((item, index, self) => self.findIndex(t => comparator(t, item)) === index);
    }

    static replace<T>(source: T[], newItem: T, comparator: (a: T, b: T) => boolean): T[] {
        return source.filter(item => !comparator(item, newItem)).concat(newItem);
    }

    static addIfUnique<T>(list: T[], item: T, comparator?: (existing: T, newItem: T) => boolean): void {
        if (comparator) {
            if (!list.some(existing => comparator(existing, item))) {
                list.push(item);
            }
        } else {
            if (!list.includes(item)) {
                list.push(item);
            }
        }
    }
    static removeLast<T>(list: T[]): void {
        list.pop();
    }

    static isEmpty(s: string): boolean {
        return s === "";
    }

    static smaller(val: number, otherVal: number): number {
        return Math.min(val, otherVal);
    }

    static larger(val: number, otherVal: number): number {
        return Math.max(val, otherVal);
    }

    static toPosix(date: Date): number {
        return Math.floor(date.getTime() / 1000);
    }

    static fromPosix(posix: number): Date {
        return new Date(posix * 1000);
    }

    static dateFromPosix(value: string | number): string {
        const date = new Date(typeof value === "string" ? parseInt(value, 10) * 1000 : value * 1000);
        return date.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });
    }

    static to_s(i: number): string {
        return i.toString();
    }

    static to_l(src: string): number {
        return src ? parseInt(src, 10) || 0 : 0;
    }

    static to_i(src: string): number {
        return parseInt(src, 10);
    }

    static isInt(src: string): boolean {
        return /^-?\d+$/.test(src);
    }

    static to_b(src: string): boolean {
        return src.toLowerCase() === "true";
    }

    static to_f(src: string): number {
        return parseFloat(src);
    }

    static to_d(src: string): number {
        return parseFloat(src);
    }

    static to_dec(src: string): number {
        return parseFloat(src);
    }

    static toEnum<T>(src: string, enumType: Record<string, T>): T {
        return enumType[src as keyof typeof enumType];
    }

    static safeToString(src: unknown): string {
        return src !== null && src !== undefined ? src.toString() : "";
    }

    static parseQuote(src: string): string {
        return src.replace(/\"/g, "'");
    }

    static parseSingleQuote(src: string): string {
        return src.replace(/'/g, "''");
    }

    static singleQuote(src: string): string {
        return `'${src}'`;
    }

    static quote(src: string): string {
        return `"${src}"`;
    }

    static exchangeQuoteSingleQuote(src: string): string {
        return src.replace(/'/g, "\0xFF").replace(/\"/g, "'").replace(/\0xFF/g, '\"');
    }

    static spaced(src: string): string {
        return ` ${src} `;
    }

    static parens(src: string): string {
        return `(${src})`;
    }

    static brackets(src: string): string {
        return `[${src}]`;
    }

    static curlyBraces(src: string): string {
        return `{${src}}`;
    }

    static removeWhitespace(input: string): string {
        return input.replace(/\s+/g, "");
    }

    static betweenString(src: string, start: string, end: string): string {
        const startIdx = src.indexOf(start);
        if (startIdx === -1) return "";
        const endIdx = src.indexOf(end, startIdx + start.length);
        if (endIdx === -1) return "";
        return src.substring(startIdx + start.length, endIdx);
    }

    static count(src: string, find: string): number {
        return src.split(find).length - 1;
    }

    static surrounding(src: string, s: string): string {
        return src.replace(s, "");
    }

    static beginsWith(src: string, s: string): boolean {
        return src.startsWith(s);
    }

    static rightOf(src: string, s: string | number): string {
        const idx = typeof s === 'string' ? src.indexOf(s) : src.indexOf(String.fromCharCode(s));
        return idx !== -1 ? src.substring(idx + (typeof s === 'string' ? s.length : 1)) : '';
    }

    static rightOfRightmostOf(src: string, s: string | number): string {
        const idx = typeof s === 'string' ? src.lastIndexOf(s) : src.lastIndexOf(String.fromCharCode(s));
        return idx !== -1 ? src.substring(idx + (typeof s === 'string' ? s.length : 1)) : '';
    }

    static leftOf(src: string, s: string | number): string {
        const idx = typeof s === 'string' ? src.indexOf(s) : src.indexOf(String.fromCharCode(s));
        return idx !== -1 ? src.substring(0, idx) : src;
    }

    static leftOfRightmostOf(src: string, s: string | number): string {
        const idx = typeof s === 'string' ? src.lastIndexOf(s) : src.lastIndexOf(String.fromCharCode(s));
        return idx !== -1 ? src.substring(0, idx) : src;
    }

    static nullIfEmpty(src: string): string | null {
        return src.length === 0 ? null : src;
    }

    static leftOfN(src: string, n: number): string {
        return src.length < n ? src : src.substring(0, n);
    }

    static rightmost(src: string): string {
        return src.length > 0 ? src[src.length - 1] : '';
    }

    static trimLastChar(src: string): string {
        return src.length > 0 ? src.substring(0, src.length - 1) : '';
    }

    static isBlank(src: string): boolean {
        return src.trim().length === 0;
    }

    static containsToken(src: string, tokens: string[]): string {
        let ret = '';
        let firstIndex = Number.MAX_VALUE;

        for (const token of tokens) {
            const idx = src.indexOf(token);
            if (idx !== -1 && idx < firstIndex) {
                ret = token;
                firstIndex = idx;
            }
        }
        return ret;
    }

    static toBase64(data: Uint8Array): string {
        return btoa(String.fromCharCode(...data));
    }

    static fromBase64(data: string): Uint8Array {
        return new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
    }

    static toUtf8(str: string): Uint8Array {
        return new TextEncoder().encode(str);
    }

    static encrypt(toEncrypt: string, password: string, salt: string): string {
        const saltBytes = Buffer.from(salt, 'ascii');
        const passwordBytes = Buffer.from(password, 'ascii');
        
        const key = pbkdf2Sync(passwordBytes, saltBytes, 1000, 32, 'sha256');
        const iv = pbkdf2Sync(passwordBytes, saltBytes, 1000, 16, 'sha256');
        
        const cipher = createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(toEncrypt, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        
        return encrypted;
    }

    static decrypt(encryptedBase64: string, password: string, salt: string): string {
        const saltBytes = Buffer.from(salt, 'ascii');
        const passwordBytes = Buffer.from(password, 'ascii');
        
        const key = pbkdf2Sync(passwordBytes, saltBytes, 1000, 32, 'sha256');
        const iv = pbkdf2Sync(passwordBytes, saltBytes, 1000, 16, 'sha256');
        
        const decipher = createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    static splitCamelCase(input: string): string {
        return input.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
    }

    static camelCase(src: string): string {
        return src.charAt(0).toLowerCase() + src.slice(1);
    }
    static pascalCase(src: string): string {
        return src ? src.charAt(0).toUpperCase() + src.slice(1) : "";
    }

    static pascalCaseWords(src: string): string {
        return src.split(" ").map(word => this.pascalCase(word)).join(" ");
    }

    static betweenNumber(b: number, a: number, c: number): boolean {
        return b >= a && b <= c;
    }

    static min(a: number, max: number): number {
        return a > max ? max : a;
    }

    static minDelta(a: number, delta: number): number {
        return a > a + delta ? a + delta : a;
    }

    static max(a: number, min: number): number {
        return a < min ? min : a;
    }

    static maxDelta(a: number, delta: number): number {
        return a < a + delta ? a + delta : a;
    }

    static until(start: number, max: number, action: (i: number) => void): void {
        for (let i = start; i < max; i++) action(i);
    }

    static allIndexesOf(source: string, substring: string): number[] {
        const indexes: number[] = [];
        let index = source.indexOf(substring);
        while (index !== -1) {
            indexes.push(index);
            index = source.indexOf(substring, index + substring.length);
        }
        return indexes;
    }

    static countOf(src: string, c: string): number {
        return src.split(c).length - 1;
    }

    static asNotNull<T>(src: T | null | undefined): T {
        if (src == null) {
            throw new Error("Value is null or undefined");
        }
        return src;
    }
}
