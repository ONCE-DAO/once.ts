import File from "./File.interface.mjs";

export default interface Folder extends File {
    getFilesByExtentions(extensions?: string[], recursive?: boolean): File[]
    getFilesByFileName(extensions?: string[], recursive?: boolean): File[]
}