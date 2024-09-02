import { AbstractMesh, TransformNode, Scene, MeshBuilder } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";
import { IMaterial } from "../objects/Material";
import { Robot } from "../objects/Robot";

export class GeometryCylinder extends IGeometry {

    constructor(private robot: Robot, private length: number = 0, private radius: number = 0) {
        super();
    }

    public async create(mat?: IMaterial) {
        this.transform = new TransformNode("cylinder-transform", this.robot.scene);

        this.meshes.push(MeshBuilder.CreateCylinder("cylinder",
            {
                diameter: this.radius * 2.0,
                height: this.length
            }, this.robot.scene));

        this.meshes[0].parent = this.transform;
        this.meshes[0].addRotation(Math.PI / 2.0, 0, 0);
        if (mat && mat.material) {
            this.meshes[0].material = mat.material;
        }
    }
}