import { AbstractMesh, TransformNode, Scene } from "@babylonjs/core";
import { IMaterial } from "../objects/Material";

export interface IGeometry {
    meshes?: AbstractMesh[];
    transform?: TransformNode;

    create(scene: Scene, mat?: IMaterial) : void;
    dispose() : void;
}