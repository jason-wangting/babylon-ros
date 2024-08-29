import { Scene, TransformNode } from "@babylonjs/core";
import Link from "./link";
import { JointType } from "../interfaces/URDF";

export default class Joint {
    public name: string = "";
    public type: JointType = JointType.Fixed;
    public transform: TransformNode | undefined;
    public parentLinkName: string = "";
    public parent: Link | undefined;
    public childLinkName: string = "";
    public child: Link | undefined;
    public lowerLimit: number = 0;
    public upperLimit: number = 0;
    public create(scene: Scene) {
        console.log('Joint Name:', this.name);

        this.transform = new TransformNode(this.name, scene);
    }
}