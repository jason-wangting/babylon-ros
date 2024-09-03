import * as BABYLON from 'babylonjs';
import * as COLLADAContext from "../context"
import {Log, LogLevel} from "../log"

import * as Utils from "./utils"
import {BoneJSON, BoundingBoxJSON} from "./format"
import * as MathUtils from '../math'
import { ExporterContext } from "./context";
import { Bone } from "../converter/bone";
import * as ConverterSkeleton from "../converter/skeleton";



    export class Skeleton {

        static toJSON(skeleton: ConverterSkeleton.Skeleton, context: ExporterContext): BoneJSON[] | undefined{
            if (!skeleton) {
                return undefined ;
            }

            // TODO: options for this
            var mat_tol: number = 6;
            var pos_tol: number = 6;
            var scl_tol: number = 6;
            var rot_tol: number = 6;

            var result: BoneJSON[] = [];
            skeleton.bones.forEach((bone) => {

                // Bone default transform
                var mat: BABYLON.Matrix = bone.node.initialLocalMatrix;
                var pos = new BABYLON.Vector3(0, 0, 0);
                var rot= new BABYLON.Quaternion(0, 0, 0, 1);
                var scl= new BABYLON.Vector3(1, 1, 1);
                mat.decompose(scl, rot, pos);

                // Bone inverse bind matrix
                var inv_bind_mat: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
                bone.invBindMatrix = BABYLON.Matrix.FromArray(inv_bind_mat);

                result.push({
                    name: bone.name,
                    parent: skeleton.bones.indexOf(bone.parent),
                    skinned: bone.attachedToSkin,
                    inv_bind_mat: inv_bind_mat,
                    matrix: mat.asArray() as number[],
                    pos: pos.asArray(),
                    rot: rot.asArray(),
                    scl: scl.asArray()
                });
            });

            return result;
        }
    }
