
import { TransformNode, Scene } from "@babylonjs/core";
import { IMaterial } from "./Material";
import { Visual } from "./Visual";
import { Robot } from "./Robot";

export class Link {
    public name: string = "";

    public material?: IMaterial;
    public transform?: TransformNode;

    public visuals: Array<Visual> = new Array<Visual>();

    constructor(private robot: Robot) {}
    // public collisions : Visual | undefined = undefined;

    public create() {
        this.transform = new TransformNode(this.name, this.robot.scene);

        if (this.visuals.length > 0) {
            for (let visual of this.visuals) {
                visual.create();
                if (visual.transform) {
                    visual.transform.parent = this.transform;
                }
            }
        }
    }

    public dispose(): void {
        this.material?.dispose();
        this.transform?.dispose();
        if (this.visuals.length > 0) {
            for (let visual of this.visuals) {
                visual.dispose();
            }
        }
    }

}