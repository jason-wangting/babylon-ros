import { AbstractMesh, TransformNode, Scene, MeshBuilder } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";
import { IMaterial } from "../objects/Material";
import { Robot } from "../objects/Robot";

export class GeometrySphere extends IGeometry {

    constructor(private robot: Robot, private radius: number) {
        super();
    }
    
    public async create(mat?: IMaterial) {
        this.transform = new TransformNode("sphere-transform", this.robot.scene);

        this.meshes.push(MeshBuilder.CreateSphere("sphere", 
            {
                diameter: this.radius * 2.0,
            }, this.robot.scene));

        this.meshes[0].parent = this.transform;
        if (mat && mat.material) {
            this.meshes[0].material = mat.material;
        }
    }
}