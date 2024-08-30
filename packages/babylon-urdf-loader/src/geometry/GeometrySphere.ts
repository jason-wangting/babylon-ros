import { AbstractMesh, TransformNode, Scene, MeshBuilder } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";
import { IMaterial } from "../objects/Material";
import { Robot } from "../objects/Robot";

export class GeometrySphere implements IGeometry {

    public meshes: AbstractMesh[] = [];
    public transform?: TransformNode;

    constructor(private robot: Robot, private radius: number) {}
    
    public create(mat?: IMaterial) : void {
        this.transform = new TransformNode("mesh_sphere", this.robot.scene);

        this.meshes.push(MeshBuilder.CreateSphere("sphere", 
            {
                diameter: this.radius * 2.0,
            }, this.robot.scene));

        this.meshes[0].parent = this.transform;
        if (mat != undefined && mat.material != undefined) {
            this.meshes[0].material = mat.material;
        }
    }

    public dispose() : void {
        if (this.meshes != undefined) {
            this.meshes.forEach(m => {
                m.dispose();
            });
        }
        this.transform?.dispose();
    }
}