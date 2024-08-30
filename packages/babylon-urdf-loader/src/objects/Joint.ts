import { Vector3, TransformNode, Scene } from "@babylonjs/core";
import * as Util from "../util";
import { Link } from "./Link";
import { IMaterial } from "./Material";

export enum JointType {
    Fixed = "fixed",
    Revolute = "revolute",
    Continuous = "continuous",
    Prismatic = "prismatic",
    Floating = "floating",
    Planar = "planar"
};


export class Joint {

    public name: string = "";
    public type: JointType = JointType.Fixed;

    public origin: Vector3 = new Vector3(0, 0, 0);
    public rpy: Vector3 = new Vector3(0, 0, 0);
    public axis: Vector3 = new Vector3(1, 0, 0);
    public transform?: TransformNode;

    public parentName: string = "";
    public childName: string = "";

    public parent?: Link;
    public child?: Link;


    public lowerLimit: number = 0;
    public upperLimit: number = 0;

    public create(scene: Scene, materialMap: Map<string, IMaterial>): void {

        this.transform = new TransformNode(this.name, scene);
        this.transform.position = this.origin;
        Util.applyRotationToTransform(this.transform, this.rpy);
    }

    public dispose(): void {
        this.transform?.dispose();
    }

}