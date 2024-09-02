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
    /**
     * root transform node of visual
     */
    public transform!: TransformNode;

    constructor(private robot: Robot) { }

    public async create() {

        this.transform = new TransformNode(this.name, this.robot.scene);
        this.transform.position = this.origin;
        Util.applyRotationToTransform(this.transform, this.rpy);

        // material is optional in the Visual
        let mat = this.material;
        if (this.material) {
            // material can refer to the materials in the robot root element.
            if (this.material.isReference()) {
                mat = this.robot.materialMap.get(this.material.name);
            } else {
                this.material.create();
            }
        }

        if (this.geometry) {
            await this.geometry.create(mat);

            if (this.geometry.transform) {
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