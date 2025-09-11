import { PanzoomInstance } from "../panzoom";
export type ControlsItem = {
    tpl: string;
    click?: (instanceRef: PanzoomInstance, event: Event) => void;
};
declare const PanzoomButtons: Record<string, ControlsItem>;
export { PanzoomButtons };
