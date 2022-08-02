// ##IGNORE_TRANSFORMER##
import { ClassDescriptorStatics } from "../../3_services/Thing/ClassDescriptor.interface.mjs";

class ClassDescriptorHandlerClass implements ClassDescriptorStatics {
    getFileName(ClassName: string): string {
        return `${ClassName}.class.meta.json`
    }
}


let ClassDescriptorHandler = new ClassDescriptorHandlerClass();
export default ClassDescriptorHandler;

