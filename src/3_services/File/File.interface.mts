export default interface File {
    fullPath: string
    basePath: string
    exists: boolean;
    extension: string;
    filename:string;
    write(content: string): void
    read(): string
}