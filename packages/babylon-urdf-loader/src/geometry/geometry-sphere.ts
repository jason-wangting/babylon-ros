import { AbstractMesh, MeshBuilder, Scene, TransformNode } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";

export default class GeometrySphere implements IGeometry {
    public length: number = 0;
    public radius: number = 0;

    public meshes: AbstractMesh[] | undefined;
    public transform: TransformNode | undefined;
    constructor(radius: number) {
        this.radius = radius;
    }

    public create(scene: Scene): void {
        this.transform = new TransformNode("mesh_sphere", scene);

        this.meshes = [];
        const sphereMesh = MeshBuilder.CreateSphere("sphere", {
            diameter: this.radius * 2.0,
        }, scene);
        sphereMesh.parent = this.transform;

        this.meshes = [sphereMesh];
    }
    public dispose(): void {
        throw new Error("Method not implemented.");
    }
}