import * as BABYLON from 'babylonjs';



/**
* A skinned mesh with an animation
*/
export class RMXModel {
    chunks: RMXModelChunk[];
    skeleton: RMXSkeleton;
    materials: RMXMaterial[];
    animations: RMXAnimation[];

    constructor() {
        this.chunks = [];
        this.skeleton = new RMXSkeleton();
        this.materials = [];
        this.animations = [];
    }
}

/**
* One piece of geometry with one material
*/
export class RMXModelChunk {
    name: string;
    triangle_count: number;
    index_offset: number;
    vertex_count: number;
    material_index: number;

    data_position: Float32Array | undefined;
    data_normal: Float32Array | undefined;
    data_texcoord: Float32Array | undefined;
    data_boneweight: Float32Array | undefined;
    data_boneindex: Uint8Array | undefined;
    data_indices: Uint32Array | undefined;

    constructor() {
        this.name = "";
        this.triangle_count = 0;
        this.vertex_count = 0;
        this.index_offset = 0;
        this.material_index = 0;
    }
}

/**
* A material.
* Does not contain coefficients, use textures instead.
*/
export class RMXMaterial {
    diffuse: string = "";
    specular: string = "";
    normal: string = "";

    diffuseColor: number[] | undefined;
    specularColor: number[] | undefined;
    emissiveColor: number[] | undefined;

    constructor() {
    }

    hash(): string {
        return "material|" + (this.diffuse || "") + "|" + (this.specular || "") + "|" + (this.normal || "") + "|" + (this.diffuseColor || "") + "|" + (this.specularColor || "" + "|" + (this.emissiveColor || ""));
    }
}

/**
* A skinned mesh skeleton
*/
export class RMXSkeleton {
    bones: RMXBone[];

    constructor() {
        this.bones = [];
    }
}

/**
* A skeleton bone.
*/
export class RMXBone {
    /** Bone name */
    name: string = "";
    /** Parent bone index */
    parent: number = 0;
    /** Indicates whether this bone is used by the geometry */
    skinned: boolean = false;
    /** Inverse bind matrix */
    inv_bind_mat: Float32Array | undefined;

    matrix: Float32Array | undefined;
    /** Rest pose position (3D vector) */
    pos: BABYLON.Vector3 = new BABYLON.Vector3();
    /** Rest pose rotation (quaternion) */
    rot: BABYLON.Quaternion = new BABYLON.Quaternion();
    /** Rest pose scale (3D vector) */
    scl: BABYLON.Vector3 = new BABYLON.Vector3();
}

/**
* A skinned mesh animation
*/
export class RMXAnimation {
    name: string;
    frames: number;
    fps: number;
    tracks: RMXAnimationTrack[];

    constructor() {
        this.name = "";
        this.frames = 0;
        this.fps = 0;
        this.tracks = [];
    }
}

/**
* An animation track.
* Contains animation curves for the transformation of a single bone.
*/
export class RMXAnimationTrack {
    bone: number;
    pos: Float32Array | undefined;
    rot: Float32Array | undefined;
    scl: Float32Array | undefined;

    constructor() {
        this.bone = 0;
    }
}
