import Thing, { ThingObjectState } from "../3_services/Thing/Thing.interface.mjs";
import EventService from "../3_services/Thing/EventService.interface.mjs";
import ClassDescriptorInterface from "../3_services/Thing/ClassDescriptor.interface.mjs";
import Class from "../3_services/Class.interface.mjs";
import ClassDescriptorHandler from "../2_systems/Things/ClassDescriptorHandler.class.mjs";
// import ClassDescriptor from "../2_systems/Things/ClassDescriptor.class.mjs";

export enum emptyEventList { }

export default abstract class BaseThing<ClassInterface> implements Thing<ClassInterface> {
  objectState: ThingObjectState = ThingObjectState.ACTIVE;

  EVENT_NAMES = emptyEventList;
  protected _eventSupport!: EventService<any>;

  static get classDescriptor(): ClassDescriptorInterface {
    throw new Error("This should be overwritten by the Once Transpiler")
    // TODO@MERGE 
    //@ts-ignore
    // return ClassDescriptorHandler.getClassDescriptor4Class(this) as ClassDescriptorInterface;
  }

  get classDescriptor(): ClassDescriptorInterface {
    throw new Error("This should be overwritten by the Once Transpiler")

    //TODO@MD Check how to do it better
    // HACK
    // @ts-ignore
    // return this.constructor.classDescriptor;
  }


  protected _name: string | undefined;
  get name(): string { return this._name || this.constructor.name };
  static _typeDescriptor: any;

  private _id: string | undefined;
  get id() {
    // TODO Preplace with correct ID generator
    if (!this._id) {
      this._id = Math.round(Math.random() * 1000000000000) + "";
    }
    return this._id;
  }

  init(...a: any[]) {
    return this;
  }

  destroy(): void {
    this.objectState = ThingObjectState.DESTROYED;
  }

  get class(): Class<this> {
    //@ts-ignore
    return this.constructor
  }


}