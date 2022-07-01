export default interface File {
    fullPath: string
    get basePath(): string
    get exists(): boolean;
    get extension(): string;
    get filename():string;
    write(content: string): void
    read(): string
}