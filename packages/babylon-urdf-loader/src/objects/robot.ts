import { Scene, TransformNode, Vector3 } from "@babylonjs/core";
import Link from "./link";
import Joint from "./joint";

export default class Robot {
    name: string = "";
    links: Map<string, Link> = new Map<string, Link>();
    joints: Map<string, Joint> = new Map<string, Joint>();
    public transform: TransformNode | undefined;
    create(scene: Scene) {
        console.log('Robot Name:', this.name);

        this.transform = new TransformNode(this.name, scene);

        // Babylon.JS coordinate system to ROS transform
        this.transform.rotation = new Vector3(-Math.PI / 2, 0, 0);

        for (let [name, link] of this.links) {
            link.create(scene);
            if (link.transform !== undefined && this.transform !== undefined) {
                link.transform.parent = this.transform;
            }
        }

        for (let [name, joint] of this.joints) {
            joint.create(scene);
            if (joint.transform !== undefined) {
                if (
                    joint.parent?.transform !== undefined
                ) {
                    joint.transform.parent = joint.parent.transform;
                }
                if (
                    joint.child?.transform !== undefined
                ) {
                    joint.child.transform.parent = joint.transform;
                }
            }

        }

        for (let [name, link] of this.links) {
            if (
                link.transform != undefined &&
                link.transform.parent == undefined
            ) {
                link.transform.parent = this.transform;
            }
        }
    }
}