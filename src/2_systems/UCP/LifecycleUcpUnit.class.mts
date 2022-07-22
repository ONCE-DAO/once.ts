import { UcpComponentDescriptorStage } from "../../3_services/UCP/UcpComponentDescriptor.interface.mjs";
import UcpLifecycleUnit, { UcpLifecycleUnitLifecycle, UcpLifecycleUnitType } from "../../3_services/UCP/UcpLifecycleUnit.interface.mjs";
import { UnitType } from "../../3_services/UCP/UcpUnit.interface.mjs";

export default class LifecycleUcpUnit implements UcpLifecycleUnit {
    name: string = '';
    unitType: UnitType.Lifecycle = UnitType.Lifecycle;
    stage: UcpComponentDescriptorStage = 'undefined';
    targetStage?: UcpComponentDescriptorStage;
    type: UcpLifecycleUnitType = 'sh';
    lifecycle?: UcpLifecycleUnitLifecycle;
    command: string = "";
}