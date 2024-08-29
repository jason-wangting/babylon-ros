import { Scene, TransformNode } from "@babylonjs/core";
import Visual from "./visual";

export default class Link {
    name: string = "";
    public visuals: Array<Visual> = new Array<Visual>();
    public transform: TransformNode | undefined;

    create(scene: Scene) {
        console.log('Link Name:', this.name);
        this.transform = new TransformNode(this.name, scene);
        
        if (this.visuals.length > 0) {
            for (let visual of this.visuals) {
                visual.create(scene);
                if (visual.transform) {
                    visual.transform.parent = this.transform;
                }
            }
        }
    }
}