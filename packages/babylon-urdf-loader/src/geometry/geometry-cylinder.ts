import { AbstractMesh, MeshBuilder, Scene, TransformNode } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";

export class GeometryCylinder implements IGeometry {
    radius: number;
    length: number;
    meshes: AbstractMesh[] | undefined;
    transform: TransformNode | undefined;
    constructor(radius: number, length: number) {
        this.radius = radius;
        this.length = length;
    }

    create(scene: Scene): void {
        console.log('GeometryCylinder');
        this.transform = new TransformNode("mesh_cylinder", scene);
        const cylinderMesh = MeshBuilder.CreateCylinder("cylinder", {
            diameter: this.radius * 2.0,
            height: this.length
        }, scene);
        this.meshes = [cylinderMesh];
        this.meshes[0].parent = this.transform;
        this.meshes[0].addRotation(Math.PI / 2.0, 0, 0);
    }

    dispose(): void {
        throw new Error("Method not implemented.");
    }
}