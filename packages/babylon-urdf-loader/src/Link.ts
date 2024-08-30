
import { TransformNode, Scene } from "@babylonjs/core";
import { IMaterial } from "./Material";
import { Visual } from "./Visual";

export class Link {
    public name : string = "";

    public material : IMaterial | undefined = undefined;
    public transform : TransformNode | undefined;

    public visuals : Array<Visual> = new Array<Visual>();

    // public collisions : Visual | undefined = undefined;

    public create(scene: Scene, materialMap : Map<string, IMaterial>) {
        this.transform = new TransformNode(this.name, scene);

        if (this.visuals.length > 0) {
            for (let visual of this.visuals) {
                visual.create(scene, materialMap);
                if (visual.transform) {
                    visual.transform.parent = this.transform;
                }
            }
        }
    }

    public dispose() : void {
        this.material?.dispose();
        this.transform?.dispose();
        if (this.visuals.length > 0) {
            for (let visual of this.visuals) {
                visual.dispose();
            }
        }
    }

}