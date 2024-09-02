import { IGeometry } from "./IGeometry";
import { Vector3, AbstractMesh, TransformNode, Scene, IParticleSystem, Skeleton, SceneLoader, Node } from '@babylonjs/core';
import { IMaterial } from '../objects/Material';
import { Robot } from "../objects/Robot";

export class GeometryMesh extends IGeometry {


    constructor(private robot: Robot, private uri: string, private scale: Vector3) {
        super();
    }

    public async create(mat?: IMaterial) {
        this.transform = new TransformNode("mesh_transform", this.robot.scene);
        this.transform.scaling = this.scale;

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
                const {
                    meshes,
                    skeletons,
                    transformNodes
                } = await SceneLoader.ImportMeshAsync(
                    null,
                    base,
                    filename,
                    this.robot.scene,
                );

                // set parent for root nodes
                meshes.forEach(mesh => {
                    if (!mesh.parent) mesh.parent = this.transform;
                });
                transformNodes.forEach(transform => {
                    if (!transform.parent) transform.parent = this.transform;
                });

                if (skeletons.length > 0) {
                    // find the top level bone in skeletons
                    const rootBone = skeletons[0].bones.find(b => b.getParent() === undefined);
                    if (rootBone) {
                        rootBone.returnToRest();
                    }
                } else {
                    meshes.forEach(m => {
                        m.addRotation(0, 0, Math.PI).addRotation(Math.PI / 2, 0, 0);
                        // Invert the left handed mesh to conform to the right handed coodinate system
                        m.scaling = new Vector3(-1, 1, 1);

                        // with not corrent dae loader
                        // m.parent = this.transform;

                        // ignore this?
                        // if (mat && mat.material) {
                        //     m.material = mat.material;
                        // }
                    });
                }
            }
        }
    }
}