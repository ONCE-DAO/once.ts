import path from 'path';
import TS from 'typescript';
import DefaultFileUcpUnit from '../../../../2_systems/Things/FileUnit.class.mjs';
import FileUcpUnit from '../../../../3_services/UCP/FileUcpUnit.interface.mjs';
import { UnitType } from '../../../../3_services/UCP/UcpUnit.interface.mjs';
import ComponentDescriptorTR from './ComponentDescriptor.class.mjs';
import { VisitorContext } from './Transformer.interface.mjs';


class TranspileFactoryClass {
    fileUnitFactory(sourceFile: TS.SourceFile, visitorContext: VisitorContext): FileUcpUnit {
        const componentDescriptor = ComponentDescriptorTR.getComponentDescriptor(sourceFile, visitorContext)

        const fileName = path.basename(sourceFile.fileName).replace(/ts$/, 'js');
        let relativePath = [...componentDescriptor.location, ...path.relative(componentDescriptor.rootDir, sourceFile.fileName).split('/')];

        let existingUnit = ONCE.rootNamespace.search(relativePath);
        if (existingUnit && "unitType" in existingUnit && !("getImplementations" in existingUnit)) return existingUnit;

        let fileUnit = new DefaultFileUcpUnit().import({ href: fileName, name: fileName, unitType: UnitType.File });
        ONCE.rootNamespace.add(fileUnit, relativePath);
        return fileUnit;
    }
}

const TranspileFactory = new TranspileFactoryClass();
export default TranspileFactory;