import { AbstractMesh, TransformNode, Scene } from '@babylonjs/core';
// import { Material } from './Material';

export interface IGeometry {
    meshes : AbstractMesh[] | undefined;
    transform : TransformNode | undefined;

    create(scene: Scene) : void;
    dispose() : void;
}