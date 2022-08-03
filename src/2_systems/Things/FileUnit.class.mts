import AbstractNamespaceChild from "../../1_infrastructure/AbstractNamespaceChild.class.mjs";
import IOR from "../../3_services/IOR.interface.mjs";
import { NamespaceObjectTypeName } from "../../3_services/Namespace/Namespace.interface.mjs";
import VersionFolder from "../../3_services/Namespace/VersionFolder.interface.mjs";
import FileUcpUnit, { FileUcpUnitFileFormat } from "../../3_services/UCP/FileUcpUnit.interface.mjs";
import { UnitType } from "../../3_services/UCP/UcpUnit.interface.mjs";
import DefaultIOR from "../NewThings/DefaultIOR.class.mjs";

export default class DefaultFileUcpUnit extends AbstractNamespaceChild implements FileUcpUnit {
    get relativeComponentPath(): string {
        let location = this.relativeComponentLocation();
        if (!location)
            throw new Error("Fail to find the location")
        return location.join("/")
    }

    private get version(): VersionFolder {
        const result = this.parent.getParentType(NamespaceObjectTypeName.VersionFolder);
        if (!result) throw new Error("Fail to find VersionFolder")
        return result;
    }

    classDescriptor: { IOR: IOR; } = { IOR: DefaultFileUcpUnit.IOR };
    unitType: UnitType = UnitType.File;
    private _href: string | undefined;
    public get href(): string {
        if (!this._href) throw new Error("Missing href")
        return this._href;
    }
    public set href(value: string) {
        this._href = value;
    }

    export(): FileUcpUnitFileFormat {
        return {
            name: this.name,
            href: this.href,
            unitType: this.unitType
        }
    }
    import(data: FileUcpUnitFileFormat): this {
        this.name = data.name;
        this.href = data.href;
        this.unitType = data.unitType;
        return this
    }

    static get IOR(): IOR {
        // HACK with hardcoded IOR
        return new DefaultIOR().init('ior:esm:/tla/EAM/Once/once[build]/DefaultFileUcpUnit');
    }
}