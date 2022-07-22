import { UcpComponentDescriptorStage } from "./UcpComponentDescriptor.interface.mjs";
import UcpUnit, { UnitType } from "./UcpUnit.interface.mjs";

export default interface UcpLifecycleUnit extends UcpUnit {
    unitType: UnitType.Lifecycle;
    stage: UcpComponentDescriptorStage
    targetStage?: UcpComponentDescriptorStage | undefined;
    type: UcpLifecycleUnitType
    lifecycle?: UcpLifecycleUnitLifecycle
    command: string;
}

export type UcpLifecycleUnitType = 'sh' | 'npx'
export type UcpLifecycleUnitLifecycle = 'start' | 'stop'
