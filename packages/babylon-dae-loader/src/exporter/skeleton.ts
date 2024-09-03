
import { BoneJSON } from "./format"
import { ExporterContext } from "./context";
import * as ConverterSkeleton from "../converter/skeleton";
import { Matrix, Vector3, Quaternion } from "@babylonjs/core";
export class Skeleton {

    static toJSON(skeleton: ConverterSkeleton.Skeleton, context: ExporterContext): BoneJSON[] | undefined {
        if (!skeleton) {
            return undefined;
        }

        // TODO: options for this
        var mat_tol: number = 6;
        var pos_tol: number = 6;
        var scl_tol: number = 6;
        var rot_tol: number = 6;

        var result: BoneJSON[] = [];
        skeleton.bones.forEach((bone) => {

            // Bone default transform
            var mat: Matrix = bone.node.initialLocalMatrix;
            var pos = new Vector3(0, 0, 0);
            var rot = new Quaternion(0, 0, 0, 1);
            var scl = new Vector3(1, 1, 1);
            mat.decompose(scl, rot, pos);

            // Bone inverse bind matrix
            var inv_bind_mat: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            bone.invBindMatrix = Matrix.FromArray(inv_bind_mat);

            result.push({
                name: bone.name,
                parent: skeleton.bones.indexOf(bone.parent!),
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
