// ##IGNORE_TRANSFORMER##

import IOR from "../../3_services/IOR.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";


/**
 * This Class is only used for the Building and will be overwritten by the Transformer
 */
export default class BuildingBootstrapClassDescriptor {
    get IOR(): IOR {
        let versionIOR = ONCE.version.IOR
        return new DefaultIOR().init('ior:esm:' + versionIOR.pathName + '/' + this.className);
    }

    constructor(private className: string) {
    }
}