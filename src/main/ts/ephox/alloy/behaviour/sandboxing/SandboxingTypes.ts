import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { AlloySpec } from '../../api/component/SpecTypes';

export interface SandboxingBehaviour extends Behaviour.AlloyBehaviour<SandboxingConfigSpec, SandboxingConfig> {
  config: (config: SandboxingConfigSpec) => Behaviour.NamedConfiguredBehaviour<SandboxingConfigSpec, SandboxingConfig>;
  cloak: (sandbox: AlloyComponent) => void;
  decloak: (sandbox: AlloyComponent) => void;
  open: (sandbox: AlloyComponent, thing: AlloySpec) => AlloyComponent;
  close: (sandbox: AlloyComponent) => void;
  isOpen: (sandbox: AlloyComponent) => boolean;
  isPartOf: (sandbox: AlloyComponent, candidate: () => Element) => boolean;
  getState: (sandbox: AlloyComponent) => Option<AlloyComponent>;
  closeSandbox: (sandbox: AlloyComponent) => void;
}

export interface SandboxingConfigSpec extends Behaviour.BehaviourConfigSpec {
  getAttachPoint: () => AlloyComponent;
  isPartOf: (container: AlloyComponent, data: AlloyComponent, queryElem: Element) => boolean;
  onOpen?: (component: AlloyComponent, menu: AlloyComponent) => void;
  onClose?: (component: AlloyComponent, menu: AlloyComponent) => void;
  cloakVisibilityAttr?: string;
}

export interface SandboxingConfig extends Behaviour.BehaviourConfigDetail {
  cloakVisibilityAttr: () => string;
  getAttachPoint: () => () => AlloyComponent;
  onOpen: () => (comp: AlloyComponent, thing: AlloyComponent) => void;
  onClose: () => (sandbox: AlloyComponent, thing: AlloyComponent) => void;
  isPartOf: () => (container: AlloyComponent, data: AlloyComponent, queryElem: Element) => boolean;
}

export interface SandboxingState {
  get: () => Option<AlloyComponent>;
  set: (comp: AlloyComponent) => void;
  isOpen: () => boolean;
  clear: () => boolean;
}