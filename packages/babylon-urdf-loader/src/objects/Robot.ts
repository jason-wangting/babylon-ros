import { TransformNode, Scene, Vector3, AbstractMesh, Node, Skeleton } from "@babylonjs/core";
import { IMaterial } from "./Material";
import { Joint } from "./Joint";
import { Link } from "./Link";


export class Robot {
    public name = "";
    public filename = "";
    /**
     * refer to https://doc.babylonjs.com/features/featuresDeepDive/importers/createImporters
     * the root URL of assets
     */
    public rootUrl = "";

    // root transform node
    public transformNode!: TransformNode;

    public linkMap: Map<string, Link> = new Map<string, Link>();
    public jointMap: Map<string, Joint> = new Map<string, Joint>();
    public materialMap: Map<string, IMaterial> = new Map<string, IMaterial>();

    constructor(
        // the scene to import into
        public scene: Scene
    ) {
        this.materialMap.set("default", new IMaterial(this));
    }

    async create() {
        this.transformNode = new TransformNode(this.name, this.scene);

        // Babylon JS coordinate system to ROS transform
        this.transformNode.rotation = new Vector3(-Math.PI / 2, 0, 0);

        // create meaterials
        for (const mat of this.materialMap.values()) {
            mat.create();
        }

        const createLinkPromises: Promise<void>[] = [];
        // create links
        for (const link of this.linkMap.values()) {
            createLinkPromises.push(link.create())            
        }
        await Promise.all(createLinkPromises);

        // create joints
        for (const joint of this.jointMap.values()) {
            joint.create();
        }

        // NOTES:
        // 1. The base_link is the root of the transform tree for mobile robots.
        // 2. base_footprint is the root of the transform tree for turtlebot and walking robots.
        // 3. All link transforms with no parent will be parented to this.transform.


        // for issue https://github.com/ms-iot/vscode-ros/issues/939,
        // Base_footprint is an orphan tree, so applying our root transform to convert to babylon coordinate system won't work.
        // We need to apply the transform to the base_link instead.

        let base = this.linkMap.get("base_link");

        if (base == null || base == undefined) {
            base = this.linkMap.get("base_footprint");
        }

        if (base == undefined) {
            throw new Error("No base_link or base_footprint defined in this robot");
        }

        // Fixup transform tree
        for (const joint of this.jointMap.values()) {
            // A Joint connects two links - each has a transform
            // We want this joint to be conncted to the "parent" link between the two links
            if (joint.transform) {
                // joint.parent is a link
                const parentLink = joint.parent;
                if (parentLink?.transform) {
                    joint.transform.parent = parentLink.transform;
                } else {
                    throw new Error(`Can not find parent link for ${joint.name}`);
                }

                // We also want the child link to point to this joints' transform.
                // joint.child is a link
                const childLink = joint.child;
                if (childLink?.transform) {
                    childLink.transform.parent = joint.transform;
                } else {
                    throw new Error(`Can not find child link for ${joint.name}`);
                }
            }
        }

        // set root link parent
        Array.from(this.linkMap.values())
            .filter(link => !link.transform.parent)
            .forEach(link => link.transform.parent = this.transformNode)
    }

    public dispose(): void {
        this.transformNode?.dispose();

        for (let [name, mat] of this.materialMap) {
            mat.material?.dispose();
        }

        for (let [name, link] of this.linkMap) {
            link.dispose();
        }

        for (let [name, joint] of this.jointMap) {
            joint.dispose();
        }
    }

    public getResult() {
        const loadedMeshes: AbstractMesh[] = [];
        const loadedTransformNodes: TransformNode[] = [];
        const loadedSkeletons: Skeleton[] = [];

        const loop = (node: Node) => {
            if (node instanceof AbstractMesh) {
                loadedMeshes.push(node);
                node.skeleton && loadedSkeletons.push(node.skeleton);
            } else if (node instanceof TransformNode) {
                loadedTransformNodes.push(node);
            }
            node.getChildren().forEach(childNode => loop(childNode));
            
        }
        loop(this.transformNode);
        return {
            loadedMeshes,
            loadedTransformNodes,
            loadedSkeletons
        }
    }
}
