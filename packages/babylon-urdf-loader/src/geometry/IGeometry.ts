import { AbstractMesh, TransformNode, Scene } from "@babylonjs/core";
import { IMaterial } from "../objects/Material";

export abstract class IGeometry {
    meshes: AbstractMesh[] = [];
    transform!: TransformNode;

    async create(mat?: IMaterial) {};
    dispose() {
        if (this.meshes) {
            this.meshes.forEach(m => {
                m.dispose();
            });
        }
        this.transform?.dispose();
    }
}