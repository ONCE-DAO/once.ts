import Class from "./Class.interface.mjs";
import ClassDescriptorInterface from "./ClassDescriptor.interface.mjs";

export default interface Thing<ClassInterface> {
  id: string;
  init(...a: any[]): any;
  name: string;

  classDescriptor: ClassDescriptorInterface
  destroy(): void;
  objectState: ThingObjectState
}

export enum ThingObjectState { 'ACTIVE' = 'active', 'DESTROYED' = 'destroyed' }
export interface ThingStatics<StaticClassInterface> extends Class<any> {
  classDescriptor: ClassDescriptorInterface
}
