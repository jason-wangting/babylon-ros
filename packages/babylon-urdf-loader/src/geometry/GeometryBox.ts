
import { Mesh, TransformNode, Scene, MeshBuilder } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";
import { IMaterial } from "../objects/Material";

export class GeometryBox implements IGeometry {
    public width : number = 0;
    public height : number = 0;
    public depth : number = 0;

    public meshes: Mesh[] = [];
    public transform?: TransformNode;

    constructor(x : number, y: number, z: number) {

        // BabylonJS maps w/h/d differently than ROS
        // d: z
        // h: y
        // w: x

        this.width = x;
        this.height = y;
        this.depth = z;
    }
    
    public create(scene: Scene, mat?: IMaterial) : void {
        this.transform = new TransformNode("mesh_box", scene);

        this.meshes.push(MeshBuilder.CreateBox("box", 
            {
                width: this.width,
                height: this.height,
                depth: this.depth,
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