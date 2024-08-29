import { AbstractMesh, MeshBuilder, Scene, TransformNode } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";

export class GeometryBox implements IGeometry {
    public width: number = 0;
    public height: number = 0;
    public depth: number = 0;

    meshes: AbstractMesh[] | undefined;
    transform: TransformNode | undefined;
    constructor(x: number, y: number, z: number) {
        // BabylonJS maps w/h/d differently than ROS
        // d: z
        // h: y
        // w: x
        this.width = x;
        this.height = y;
        this.depth = z;
    }

    create(scene: Scene): void {
        console.log('GeometryBox');
        this.transform = new TransformNode("mesh_box", scene);
        const boxMesh = MeshBuilder.CreateBox("box",
            {
                width: this.width,
                height: this.height,
                depth: this.depth,
            }, scene);
        this.meshes = [boxMesh];
        this.meshes[0].parent = this.transform;
    }

    dispose(): void {
        throw new Error("Method not implemented.");
    }
}