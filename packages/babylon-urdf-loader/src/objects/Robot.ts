import { TransformNode, Scene, Vector3 } from "@babylonjs/core";
import { IMaterial } from "./Material";
import { Joint } from "./Joint";
import { Link } from "./Link";


export class Robot {
    public name: string = "";

    public transform: TransformNode | undefined;

    public links: Map<string, Link> = new Map<string, Link>();
    public joints: Map<string, Joint> = new Map<string, Joint>();
    public materials: Map<string, IMaterial> = new Map<string, IMaterial>();

    constructor() {
        this.materials.set("default", new IMaterial());
    }

    create(scene: Scene) {
        this.transform = new TransformNode(this.name, scene);

        // Babylon JS coordinate system to ROS transform
        this.transform.rotation = new Vector3(-Math.PI / 2, 0, 0);

        for (let [name, mat] of this.materials) {
            mat.create(scene);
        }

        for (let [name, link] of this.links) {
            link.create(scene, this.materials);
        }

        for (let [name, joint] of this.joints) {
            joint.create(scene, this.materials);
        }

        // NOTES:
        // 1. The base_link is the root of the transform tree for mobile robots.
        // 2. base_footprint is the root of the transform tree for turtlebot and walking robots.
        // 3. All link transforms with no parent will be parented to this.transform.


        // for issue https://github.com/ms-iot/vscode-ros/issues/939,
        // Base_footprint is an orphan tree, so applying our root transform to convert to babylon coordinate system won't work.
        // We need to apply the transform to the base_link instead.

        let base = this.links.get("base_link");

        if (base == null || base == undefined) {
            base = this.links.get("base_footprint");
        }

        if (base == undefined) {
            throw new Error("No base_link or base_footprint defined in this robot");
        }

        // Fixup transform tree
        for (let [name, joint] of this.joints) {
            // A Joint connects two links - each has a transform
            // We want this joint to be conncted to the "parent" link between the two links
            if (joint.transform) {
                if (joint.parent && joint.parent.transform) {
                    joint.transform.parent = joint.parent.transform;
                } else {
                    // TODO: Is this a bug?
                }

                // We also want the child link to point to this joints' transform.
                if (joint.child && joint.child.transform) {
                    joint.child.transform.parent = joint.transform;
                } else {
                    // TODO: Is this a bug?
                }
            }
        }

        for (let [name, link] of this.links) {
            if (link.transform && link.transform.parent == undefined) {
                link.transform.parent = this.transform;
            }
        }
    }

    public dispose(): void {
        this.transform?.dispose();

        for (let [name, mat] of this.materials) {
            mat.material?.dispose();
        }

        for (let [name, link] of this.links) {
            link.dispose();
        }

        for (let [name, joint] of this.joints) {
            joint.dispose();
        }
    }
}
