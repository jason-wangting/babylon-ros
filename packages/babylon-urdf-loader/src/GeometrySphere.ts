import { AbstractMesh, TransformNode, Scene, MeshBuilder } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";
import { IMaterial } from "./Material";

export class Sphere implements IGeometry {
    public radius : number = 0;


    public meshes: AbstractMesh[] = [];
    public transform : TransformNode | undefined;

    constructor(r: number) {
        this.radius = r;
    }
    
    public create(scene: Scene, mat : IMaterial | undefined) : void {
        this.transform = new TransformNode("mesh_sphere", scene);

        this.meshes.push(MeshBuilder.CreateSphere("sphere", 
            {
                diameter: this.radius * 2.0,
            }, scene));

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