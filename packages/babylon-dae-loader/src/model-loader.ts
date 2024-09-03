import {Context} from "./context"
import { DataChunkJSON, GeometryJSON, DocumentJSON, BoneJSON, AnimationTrackJSON, AnimationJSON, MaterialJSON } from "./exporter/format";
import {LogLevel} from "./log"
import * as Model from "./model"
import * as ModelAnimation from "./model-animation"

/**
* Loads our custom file format
*/
export class RMXModelLoader {

    constructor() {
    }

    private loadFloatData(json: DataChunkJSON, data: ArrayBuffer): Float32Array  | undefined{
        if (json) {
            return new Float32Array(data, json.byte_offset, json.count * json.stride);
        } else {
            return null;
        }
    }

    private loadUint8Data(json: DataChunkJSON, data: ArrayBuffer): Uint8Array | undefined{
        if (json) {
            return new Uint8Array(data, json.byte_offset, json.count * json.stride);
        } else {
            return null;
        }
    }

    private loadUint32Data(json: DataChunkJSON, data: ArrayBuffer): Uint32Array {
        if (json) {
            return new Uint32Array(data, json.byte_offset, json.count * json.stride);
        } else {
            return null;
        }
    }

    private loadModelChunk(json: GeometryJSON, data: ArrayBuffer): Model.RMXModelChunk {
        var result = new Model.RMXModelChunk;

        result.name = json.name;
        result.triangle_count = json.triangle_count;
        result.material_index = json.material;

        result.data_position   = this.loadFloatData(json.position, data);
        result.data_normal     = this.loadFloatData(json.normal, data);
        result.data_texcoord   = this.loadFloatData(json.texcoord, data);
        result.data_boneweight = this.loadFloatData(json.boneweight, data);
        result.data_boneindex  = this.loadUint8Data(json.boneindex, data);
        result.data_indices    = this.loadUint32Data(json.indices, data);

        // Three.js wants float data
        if (result.data_boneindex) {
            result.data_boneindex = new Uint8Array(result.data_boneindex);
        }

        return result;
    }

    loadModel(json: DocumentJSON, data: ArrayBuffer): Model.RMXModel {
        var result = new Model.RMXModel;

        // Load geometry
        result.chunks = json.chunks.map((chunk) => { return this.loadModelChunk(chunk, data) });

        // Load skeleton
        result.skeleton = this.loadSkeleton(json, data);

        // Load animations
        result.animations = json.animations.map((animation) => { return this.loadAnimation(animation, data) });

        // Load materials
        result.materials = json.materials.map((material) => { return this.loadMaterial(material, data) });

        return result;
    }

    private loadBone(json: BoneJSON, data: ArrayBuffer): Model.RMXBone {
        if (json == null) {
            return null;
        }

        var result: Model.RMXBone = new Model.RMXBone;

        result.name = json.name;
        result.parent = json.parent;
        result.skinned = json.skinned;
        result.inv_bind_mat = new Float32Array(json.inv_bind_mat);
        result.matrix = new Float32Array(json.matrix);
        result.pos.set(json.pos[0], json.pos[1], json.pos[2]);
        result.rot.set(json.rot[0], json.rot[1], json.rot[2], json.rot[3]);
        result.scl.set(json.scl[0], json.scl[1], json.scl[2]);

        return result;
    }

    private loadSkeleton(json: DocumentJSON, data: ArrayBuffer): Model.RMXSkeleton {
        if (json.bones == null || json.bones.length == 0) {
            return null;
        }

        var result = new Model.RMXSkeleton;

        result.bones = json.bones.map((bone) => { return this.loadBone(bone, data) });

        return result;
    }

    private loadAnimationTrack(json: AnimationTrackJSON, data: ArrayBuffer): Model.RMXAnimationTrack {
        if (json == null) {
            return null;
        }

        var result = new Model.RMXAnimationTrack;
        result.bone = json.bone;
        result.pos = this.loadFloatData(json.pos, data);
        result.rot = this.loadFloatData(json.rot, data);
        result.scl = this.loadFloatData(json.scl, data);
        return result;
    }

    private loadAnimation(json: AnimationJSON, data: ArrayBuffer): Model.RMXAnimation {
        if (json == null) {
            return null;
        }

        var result = new Model.RMXAnimation;
        result.name = json.name;
        result.fps = json.fps;
        result.frames = json.frames;
        result.tracks = json.tracks.map((track) => { return this.loadAnimationTrack(track, data) });

        return result;
    }

    private loadMaterial(json: MaterialJSON, data: ArrayBuffer): Model.RMXMaterial {
        var result = new Model.RMXMaterial;
        result.diffuse = json.diffuse;
        result.specular = json.specular;
        result.normal = json.normal;

        result.diffuseColor = json.diffuseColor;
        result.specularColor = json.specularColor;
        result.emissiveColor = json.emissiveColor;
        

        return result;
    }
}
