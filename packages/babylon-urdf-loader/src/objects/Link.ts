
import { TransformNode, Scene } from "@babylonjs/core";
import { Visual } from "./Visual";
import { Robot } from "./Robot";

export class Link {
    public name: string = "";

    public transform!: TransformNode;

    public visuals: Array<Visual> = new Array<Visual>();

    constructor(private robot: Robot) {}
    // public collisions : Visual | undefined = undefined;

    public async create() {
        // link root transform node
        this.transform = new TransformNode(this.name, this.robot.scene);

        const promises: Promise<void>[] = [];
        for (let visual of this.visuals) {
            promises.push(new Promise(async (resolve, reject) => {
                await visual.create();
                visual.transform.parent = this.transform;
                resolve();
            }))            
        }
        await Promise.all(promises);
    }

    public dispose(): void {
        this.transform?.dispose();
        if (this.visuals.length > 0) {
            for (let visual of this.visuals) {
                visual.dispose();
            }
        }
    }

}