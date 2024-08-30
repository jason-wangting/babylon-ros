import { Vector3, TransformNode, Scene, Material } from '@babylonjs/core';
import { IMaterial } from './Material';
import { IGeometry } from '../geometry/IGeometry';
import * as Util from '../util';
import { Robot } from './Robot';

export class Visual {
    public name: string = "";

    public geometry?: IGeometry;

    public material?: IMaterial;

    public origin: Vector3 = new Vector3(0, 0, 0);
    public rpy: Vector3 = new Vector3(0, 0, 0);
    public transform?: TransformNode;

    constructor( private robot: Robot ) {}

    public create(): void {

        this.transform = new TransformNode(this.name, this.robot.scene);
        this.transform.position = this.origin;
        Util.applyRotationToTransform(this.transform, this.rpy);

        let mat = this.material;
        if (this.material != undefined) {
            if (this.material.isReference()) {
                mat = this.robot.materials.get(this.material.name);
            } else {
                this.material.create();
            }
        }

        if (this.geometry != undefined) {
            this.geometry.create(mat);

            if (this.transform != undefined && this.geometry.transform != undefined) {
                this.geometry.transform.parent = this.transform;
            }
        }
    }

    public dispose(): void {
        this.geometry?.dispose();

        // References will be disposed by the robot
        if (this.material?.isReference()) {
            this.material?.dispose();
        }

        this.transform?.dispose();
    }
}