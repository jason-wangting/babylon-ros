import { AbstractMesh, TransformNode, Scene, MeshBuilder } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";
import { IMaterial } from "./Material";

export class Cylinder implements IGeometry {
    public length : number = 0;
    public radius : number = 0;


    public meshes: AbstractMesh[] = [];
    public transform : TransformNode | undefined;

    constructor(l : number, r: number) {
        this.length = l;
        this.radius = r;
    }
    
    public create(scene: Scene, mat : IMaterial | undefined) : void {
        this.transform = new TransformNode("mesh_cylinder", scene);

        this.meshes.push(MeshBuilder.CreateCylinder("cylinder", 
            {
                diameter: this.radius * 2.0,
                height: this.length
            }, scene));

        this.meshes[0].parent = this.transform;
        this.meshes[0].addRotation(Math.PI / 2.0, 0, 0);
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