import 'babylonjs-loaders';
import { IGeometry } from "./IGeometry";
import path from 'path';
import { readFileSync } from 'fs';
import { Vector3, AbstractMesh, TransformNode, Material, Scene, IParticleSystem, Skeleton, SceneLoader } from '@babylonjs/core';
import { IMaterial } from './Material';
const uuid = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export class Mesh implements IGeometry {
    public uri: string = "";
    public scale: Vector3 = new Vector3(1.0, 1.0, 1.0);

    public meshes: AbstractMesh[] | undefined = undefined;
    public transform : TransformNode | undefined = undefined;
    public material : IMaterial | undefined = undefined;

    constructor(uri: string, scale: Vector3) {
        this.uri = uri;
        this.scale = scale;
    }
    
    private meshCallback(scene: Scene, meshes : AbstractMesh[], particleSystems : IParticleSystem[] | undefined, skeletons : Skeleton[] | undefined) {
        // Get a pointer to the mesh
        console.log(meshes);
        console.log(meshes[0].getChildMeshes());
        if (meshes.length > 0 && this.transform != undefined) {
            this.meshes = meshes;
            this.meshes[0].parent = this.transform;
            this.meshes.forEach(m => m.name = uuid());
            // find the top level bone in skeletons
            if (skeletons != undefined && skeletons.length > 0) {
                let rootBone = skeletons[0].bones.find(b => b.getParent() == undefined);
                if (rootBone != undefined) {
                    rootBone.returnToRest();
                }
            } else {

                this.meshes.forEach(m => {
                    if (this.transform != undefined) {
                        m.addRotation(0, 0, Math.PI).addRotation(Math.PI/2, 0, 0);
                        // Invert the left handed mesh to conform to the right handed coodinate system
                        m.scaling = new Vector3(-1, 1, 1);
                        m.parent = this.transform;
                        
                        if (this.material != undefined && this.material.material != undefined) {
                            m.material = this.material.material;
                        }
                    }
                });
            }
        }
    }


    public create(scene: Scene, mat : IMaterial | undefined) : void {
        this.transform = new TransformNode("mesh_mesh", scene);
        this.transform.scaling = this.scale;

        this.material = mat;

        if (this.uri.startsWith("file://"))
        {
            // Handle relative paths
            var filePath = this.uri.substring(7); 
            if (!filePath.startsWith("/")) {
                filePath = path.join(__dirname, filePath);
            }
            var fileExtension = filePath.substring(filePath.lastIndexOf('.'));
            var meshdata = readFileSync(filePath).toString('base64');

            // Force the file to be read as base64 encoded data blob
            SceneLoader.ImportMesh(null, "", "data:;base64," + meshdata, scene, (mesh, ps, sk) => {this.meshCallback(scene, mesh, ps, sk)}, null, null, fileExtension);
        } else {
            let filename = this.uri.substring(this.uri.lastIndexOf('/') + 1);
            if (filename) {
                let base = this.uri.substring(0, this.uri.lastIndexOf('/') + 1);
                SceneLoader.ImportMesh(null, base, filename, scene, (...args) => {
                    console.log(args);
                    const [mesh, ps, sk] = args;
                    this.meshCallback(scene, mesh, ps, sk)});
            }
        }
    }

    public dispose(): void {
        if (this.meshes != undefined) {
            this.meshes.forEach(m => {
                m.dispose();
            });
        }
        this.transform?.dispose();
    }
}