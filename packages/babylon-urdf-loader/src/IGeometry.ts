import { AbstractMesh, TransformNode, Scene, Material } from "@babylonjs/core";
import { IMaterial } from "./Material";

export interface IGeometry {
    meshes : AbstractMesh[] | undefined;
    transform : TransformNode | undefined;

    create(scene: Scene, mat : IMaterial | undefined) : void;
    dispose() : void;
}