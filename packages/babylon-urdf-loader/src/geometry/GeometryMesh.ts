import { IGeometry } from "./IGeometry";
import { Vector3, AbstractMesh, TransformNode, Scene, IParticleSystem, Skeleton, SceneLoader } from '@babylonjs/core';
import { IMaterial } from '../objects/Material';
import { Robot } from "../objects/Robot";

export class GeometryMesh implements IGeometry {

    public meshes?: AbstractMesh[];
    public transform?: TransformNode;
    public material?: IMaterial;

    constructor(private robot: Robot, private uri: string, private scale: Vector3) {}
    
    private meshCallback(meshes : AbstractMesh[], particleSystems : IParticleSystem[] | undefined, skeletons : Skeleton[] | undefined) {
        // Get a pointer to the mesh
        if (meshes.length > 0 && this.transform) {
            this.meshes = meshes;
            this.meshes[0].parent = this.transform;
            // find the top level bone in skeletons
            if (skeletons && skeletons.length > 0) {
                let rootBone = skeletons[0].bones.find(b => b.getParent() === undefined);
                if (rootBone) {
                    rootBone.returnToRest();
                }
            } else {

                this.meshes.forEach(m => {
                    if (this.transform) {
                        m.addRotation(0, 0, Math.PI).addRotation(Math.PI/2, 0, 0);
                        // Invert the left handed mesh to conform to the right handed coodinate system
                        m.scaling = new Vector3(-1, 1, 1);
                        m.parent = this.transform;
                        
                        if (this.material && this.material.material) {
                            m.material = this.material.material;
                        }
                    }
                });
            }
        }
    }


    public create(mat?: IMaterial) : void {
        this.transform = new TransformNode("mesh_mesh", this.robot.scene);
        this.transform.scaling = this.scale;

        this.material = mat;

        let modelUri = this.uri;
        if (modelUri.startsWith("package://")) {
            modelUri = `${this.robot.rootUrl}${this.uri.replace("package://", "")}`
        }

        if (modelUri.startsWith("file://")) {
            // Handle relative paths
            // var filePath = modelUri.substring(7); 
            // if (!filePath.startsWith("/")) {
            //     filePath = path.join(__dirname, filePath);
            // }
            // var fileExtension = filePath.substring(filePath.lastIndexOf('.'));
            // var meshdata = readFileSync(filePath).toString('base64');

            // // Force the file to be read as base64 encoded data blob
            // SceneLoader.ImportMesh(null, "", "data:;base64," + meshdata, scene, (mesh, ps, sk) => {this.meshCallback(scene, mesh, ps, sk)}, null, null, fileExtension);
        } else {
            const filename = modelUri.substring(modelUri.lastIndexOf('/') + 1);
            if (filename) {
                const base = modelUri.substring(0, modelUri.lastIndexOf('/') + 1);
                SceneLoader.ImportMesh(null, base, filename, this.robot.scene, this.meshCallback.bind(this));
            }
        }
    }

    public dispose(): void {
        if (this.meshes) {
            this.meshes.forEach(m => {
                m.dispose();
            });
        }
        this.transform?.dispose();
    }
}