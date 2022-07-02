import File from "./File.interface.mjs";

export default interface Folder extends File {
    getFilesByOnceExtentions(extensions?: string[], recursive?: boolean): File[]
    getFilesByExtentions(extensions?: string[], recursive?: boolean): File[]
    getFilesByFileName(extensions?: string[], recursive?: boolean): File[]
}