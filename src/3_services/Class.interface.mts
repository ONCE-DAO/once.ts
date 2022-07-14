export interface Class<ClassInstance> {
  new(...args: any[]): ClassInstance;
}

export default Class;