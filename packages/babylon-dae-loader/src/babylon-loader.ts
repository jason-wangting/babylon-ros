import { Material, Scene, VertexData, Texture, Color3, StandardMaterial, AbstractMesh, Bone, Matrix, Mesh, Skeleton } from "@babylonjs/core";
import {Context} from "./context"
import {LogLevel} from "./log"
import * as Model from "./model"
import * as ModelAnimation from "./model-animation"


/**
* Converts a RMXModel into corresponding three.js objects
*/
export class BabylonModelLoader {

    private materialCache: { [hash: string]: Material };

    constructor() {
        this.materialCache = {};
    }

    private createGeometry(chunk: Model.RMXModelChunk, scene : Scene): VertexData {
        var vertexData = new VertexData();

        if (chunk.data_position) {
            vertexData.positions = chunk.data_position;
        }
        if (chunk.data_normal) {
            vertexData.normals = chunk.data_normal;
        }
        if (chunk.data_texcoord) {
            vertexData.uvs = chunk.data_texcoord;
        }
        if (chunk.data_boneindex) {
            //result.addAttribute("skinIndex", new THREE.BufferAttribute(chunk.data_boneindex, 4));
        }
        if (chunk.data_boneindex) {
            //result.addAttribute("skinWeight", new THREE.BufferAttribute(chunk.data_boneweight, 4));
        }
        if (chunk.data_indices) {
            vertexData.indices = chunk.data_indices;

            // reverse the winding order
            for (var i = 0; i < vertexData.indices.length; i += 3) {
                var tmp = vertexData.indices[i];
                vertexData.indices[i] = vertexData.indices[i + 2];
                vertexData.indices[i + 2] = tmp;
            }
        }

        return vertexData;
    }

    private createTexture(url: string, scene : Scene): Texture {
        if ((url == null)  || (url == "")) {
            return new Texture("", scene);
        }

        // TODO Polyhobbyist

        return new Texture(url, scene);
    }

    private parseColor(color: string) : Color3 {
        color = color.trim();
        var rgba = color.split(' ');
        if (rgba.length >= 3) {
            throw new Error("Color ${rgba} does not have 3 values")
        }
    
        return new Color3(parseFloat(rgba[0]), parseFloat(rgba[1]), parseFloat(rgba[2]));
    }

    private createMaterial(material: Model.RMXMaterial, skinned: boolean, scene : Scene): Material {
        var prefix = skinned ? "skinned-" : "static-";
        var hash = prefix + material.hash();
        var cached_material = this.materialCache[hash];

        if (cached_material) {
            return cached_material;
        } else {
            var result = new StandardMaterial(hash, scene);
            //result.skinning = skinned;
            if (material.diffuse) {
                result.diffuseTexture = this.createTexture(material.diffuse, scene);
            }

            if (material.specular) {
                result.specularTexture = this.createTexture(material.specular, scene);
            }

            if (material.diffuseColor != undefined && material.diffuseColor.length == 4) {
                result.diffuseColor = new Color3(material.diffuseColor[0], material.diffuseColor[1], material.diffuseColor[2]);
            }

            if (material.emissiveColor != undefined && material.emissiveColor.length == 4) {
                result.emissiveColor = new Color3(material.emissiveColor[0], material.emissiveColor[1], material.emissiveColor[2]);
            }

            if (material.specularColor != undefined && material.specularColor.length == 4) {
                result.specularColor = new Color3(material.specularColor[0], material.specularColor[1], material.specularColor[2])
            }

            this.materialCache[hash] = result;
            return result;
        }
    }

    createBabylonModel(model: Model.RMXModel, scene : Scene): BabylonModel {
        var result = new BabylonModel();
        var skinned = model.skeleton? true : false;
        var bones : Bone[] = [];

        const rootMesh = new Mesh("root-mesh", scene);
        result.meshes.push(rootMesh);

       // Convert RMX skeleton to Skeleton
        if (model.skeleton) {
            result.skeleton = new Skeleton("Skeleton", "", scene);
            for (var i = 0; i < model.skeleton.bones.length; ++i) {
                var bone = model.skeleton.bones[i];
                var parentBone = undefined;
                if (bone.parent >= 0 && bone.parent < bones.length) {
                    parentBone = bones[bone.parent];
                }

                let boneMatrix = Matrix.FromArray(bone.matrix!);

                var babylon_bone = new Bone(bone.name, result.skeleton, parentBone, boneMatrix);
                bones.push(babylon_bone);
            }

            result.skeleton.bones = bones;
            result.meshes[0].skeleton = result.skeleton;
        }

        // Geometry
        for (var i = 0; i < model.chunks.length; ++i) {
            var rmx_chunk = model.chunks[i];

            var chunk = new BabylonModelChunk();
            chunk.geometry = this.createGeometry(rmx_chunk, scene);
            chunk.material = this.createMaterial(model.materials[rmx_chunk.material_index], skinned, scene);
            result.chunks.push(chunk);

            if (chunk.geometry) {
                var m = new Mesh(rmx_chunk.name, scene);
                chunk.geometry.applyToMesh(m);
                m.material = chunk.material;
                m.parent = rootMesh;

                // Attach mesh m to bones in the skeleton
                if (result.skeleton) {
                    // for each index in the bone index buffer, find the corresponding bone
                    // and add the mesh to the list of meshes that are influenced by that bone
                    var bone_indices: any = rmx_chunk.data_boneindex;
                    var bone_weights: any = rmx_chunk.data_boneweight;
                    var bone_count = bone_indices.length / 4;
                    for (var j = 0; j < bone_count; ++j) {
                        var bone_index = bone_indices[j * 4];
                        var bone_weight = bone_weights[j * 4];
                        if (bone_index >= 0 && bone_index < bones.length) {
                            var bbone = bones[bone_index];
                            //var bt = bbone.getTransformNode();
                            m.attachToBone(bbone, rootMesh);
                        }
                    }
                }
            }
        }

        result.skeleton!.prepare();
        result.skeleton!.returnToRest();
        

        // Animation - use custom object
        result.animations = model.animations;

        return result;
    }
}

/**
* A custom class that replaces THREE.Skeleton
*/
export class BabylonSkeleton {
    boneTexture: ModelAnimation.RMXBoneMatrixTexture;
    skeleton: Model.RMXSkeleton;
    pose: ModelAnimation.RMXPose;

    constructor(skeleton: Model.RMXSkeleton) {
        // The skeleton stores information about the hiearchy of the bones
        this.skeleton = skeleton;

        // The pose stores information about the current bone transformations
        this.pose = new ModelAnimation.RMXPose(skeleton.bones.length);
        ModelAnimation.RMXSkeletalAnimation.resetPose(this.skeleton, this.pose);

        // The bone texture stores the bone matrices for the use on the GPU
        this.boneTexture = new ModelAnimation.RMXBoneMatrixTexture(skeleton.bones.length);
    }

    update(gl: WebGLRenderingContext) {
        // Compute the bone matrices
        ModelAnimation.RMXSkeletalAnimation.exportPose(this.skeleton, this.pose, this.boneTexture.data);

        // Upload the bone matrices to the bone texture
        this.boneTexture.update(gl);
    }
}

/**
* Stores information about a piece of geometry
*/
class BabylonModelChunk {
    geometry: VertexData | undefined = undefined;
    material: Material | undefined = undefined;

    constructor() {
    }
}

export class BabylonModelInstance {
    model: BabylonModel;
    skeleton: BabylonSkeleton | undefined;

    constructor(model: BabylonModel, skeleton: BabylonSkeleton | undefined) {
        this.model = model;
        this.skeleton = skeleton;
    }
}

/**
* A factory for producing objects that behave like THREE.SkinnedMesh
*/
export class BabylonModel {
    chunks: BabylonModelChunk[] = [];
    skeleton: Skeleton | undefined;
    animations: Model.RMXAnimation[] = [];
    static identityMatrix: Matrix = new Matrix();


    meshes: AbstractMesh[] = [];

    constructor() {
    }
}
