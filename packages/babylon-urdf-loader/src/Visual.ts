import { Vector3, TransformNode, Scene, Material } from '@babylonjs/core';
import { IMaterial } from './Material';
import { IGeometry } from './IGeometry';
import * as Util from './util';

export class Visual {
    public name : string = "";

    public geometry : IGeometry | undefined = undefined;

    public material : IMaterial | undefined = undefined;

    public origin : Vector3 = new Vector3(0, 0, 0);
    public rpy : Vector3 = new Vector3(0, 0, 0);
    public transform : TransformNode | undefined;

    public create(scene: Scene, materialMap : Map<string, IMaterial>) : void {

        this.transform = new TransformNode(this.name, scene);
        this.transform.position = this.origin;
        Util.applyRotationToTransform(this.transform, this.rpy);

        let mat = this.material;
        if (this.material != undefined) {
            if (this.material.isReference()) {
                mat = materialMap.get(this.material.name);
            } else {
                this.material.create(scene);
            }
        }

        if (this.geometry != undefined) {
            this.geometry.create(scene, mat);

            if (this.transform  != undefined && this.geometry.transform != undefined) {
                this.geometry.transform.parent = this.transform;
            }
        }
    }

    public dispose() : void {
        this.geometry?.dispose();

        // References will be disposed by the robot
        if (this.material?.isReference()) {
            this.material?.dispose();
        }

        this.transform?.dispose();
    }
}