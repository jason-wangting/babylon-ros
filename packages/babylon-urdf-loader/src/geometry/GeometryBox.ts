
import { Mesh, TransformNode, Scene, MeshBuilder } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";
import { IMaterial } from "../objects/Material";
import { Robot } from "../objects/Robot";

export class GeometryBox extends IGeometry {

    // BabylonJS maps w/h/d differently than ROS
    // d: z
    // h: y
    // w: x
    constructor(
        private robot: Robot,
        private width: number = 0,
        private height: number = 0,
        private depth: number = 0) {
            super();
        }

    public async create(mat?: IMaterial) {
        this.transform = new TransformNode("box-transform", this.robot.scene);

        this.meshes.push(MeshBuilder.CreateBox("box",
            {
                width: this.width,
                height: this.height,
                depth: this.depth,
            }, this.robot.scene));

        this.meshes[0].parent = this.transform;
        if (mat && mat.material) {
            this.meshes[0].material = mat.material;
        }
    }

}