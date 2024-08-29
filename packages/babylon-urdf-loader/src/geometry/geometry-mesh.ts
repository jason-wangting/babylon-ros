import { AbstractMesh, Scene, SceneLoader, SceneLoaderSuccessCallback, TransformNode, Vector3 } from "@babylonjs/core";
import { IGeometry } from "./IGeometry";
import { getBaseAndFileName } from "../util";

export default class GeometryMesh implements IGeometry {
    public uri: string = "";
    public scale: Vector3 = new Vector3(1, 1, 1);

    public meshes: AbstractMesh[] | undefined;
    public transform: TransformNode | undefined;

    constructor(uri: string, scale: Vector3) {
        this.uri = uri;
        this.scale = scale;
    }
    private meshCallback: SceneLoaderSuccessCallback = (meshes, particleSystems, skeletons, animationGroups) => {
        if (meshes.length > 0 && this.transform !== undefined) {
            this.meshes = meshes;
            this.meshes[0].parent = this.transform;

            // find the top level bone in skeletons
            if (skeletons != undefined && skeletons.length > 0) {
                let rootBone = skeletons[0].bones.find(b => b.getParent() == undefined);
                if (rootBone != undefined) {
                    rootBone.returnToRest();
                }
            } else {

                this.meshes.forEach(m => {
                    if (this.transform != undefined) {
                        m.addRotation(0, 0, Math.PI).addRotation(Math.PI / 2, 0, 0);
                        // Invert the left handed mesh to conform to the right handed coodinate system
                        m.scaling = new Vector3(-1, 1, 1);
                        m.parent = this.transform;

                        // if (this.material != undefined && this.material.material != undefined) {
                        //     m.material = this.material.material;
                        // }
                    }
                });
            }
        }
    }
    public create(scene: Scene): void {
        this.transform = new TransformNode("mesh", scene);
        this.transform.scaling = this.scale;

        const { base, filename } = getBaseAndFileName(this.uri);
        SceneLoader.ImportMesh(
            null,
            base,
            filename,
            scene,
            this.meshCallback
        )
    }
    public dispose(): void {
        throw new Error("Method not implemented.");
    }
}