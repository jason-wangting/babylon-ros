import {Log, LogLevel} from "../log"
import { NodeTransform } from "../loader/node_transform"


import * as Utils from "./utils"
import * as MathUtils from "../math"
import {Bone} from "./bone"
import {Texture} from "./texture"
import {Animation, AnimationTarget} from "./animation"
import * as COLLADAContext from "../context"
import {Options} from "./options"
import {BoundingBox} from "./bounding_box"
import * as BABYLON from 'babylonjs';
import { AnimationChannel } from "./animation_channel"
import { ConverterContext } from "./context"


    export enum TransformType {
        Translation = 1,
        Rotation = 2,
        Scale = 3
    };

    export class Transform {
        data: Float32Array;
        original_data: Float32Array;
        rows: number;
        colums: number;
        channels: AnimationChannel[] | undefined;

        constructor(transform: NodeTransform, rows: number, columns: number) {
            this.rows = rows;
            this.colums = columns;
            this.channels = [];
            var data_elements: number = rows * columns;
            this.data = new Float32Array(data_elements);
            this.original_data = new Float32Array(data_elements);
            for (var i = 0; i < data_elements; ++i) {
                this.data[i] = transform.data[i];
                this.original_data[i] = transform.data[i];
            }
        }
        getTargetDataRows(): number {
            return this.rows;
        }
        getTargetDataColumns(): number {
            return this.colums;
        }
        applyAnimation(channel: AnimationChannel, time: number, context: ConverterContext) {
            AnimationChannel?.applyToData(channel, this.data, time, context);
            this.updateFromData();
        }
        registerAnimation(channel: AnimationChannel): void {
            this.channels?.push(channel);
        }
        isAnimated(): boolean {
            return this.channels?this.channels.length > 0:false;
        }
        isAnimatedBy(animation: Animation): boolean {
            if (animation !== null && this.channels) {
                for (var i: number = 0; i < this.channels.length || 0; ++i) {
                    var channel: AnimationChannel = this.channels[i];
                    if (animation.channels.indexOf(channel) !== -1) {
                        return true;
                    }
                }
                return false;
            } else {
                return this.channels?this.channels.length > 0:false;
            }
        }
        resetAnimation() {
            for (var i = 0; i < this.data.length; ++i) {
                this.data[i] = this.original_data[i];
            }
            this.updateFromData();
        }
        applyTransformation(mat: BABYLON.Matrix) {
            throw new Error("Not implemented");
        }
        updateFromData() {
            throw new Error("Not implemented");
        }
        hasTransformType(type: TransformType): boolean {
            throw new Error("Not implemented");
        }
    }

    export class TransformMatrix extends Transform implements AnimationTarget {
        matrix: BABYLON.Matrix;
        constructor(transform: NodeTransform) {
            super(transform, 4, 4);
            this.matrix = new BABYLON.Matrix();
            this.updateFromData();
        }
        updateFromData() {
            MathUtils.mat4Extract(this.data, 0, this.matrix);
        }
        applyTransformation(mat: BABYLON.Matrix) {
            mat.copyFrom(mat.multiply(this.matrix));
        }
        hasTransformType(type: TransformType): boolean {
            return true;
        }
    }

    export class TransformRotate extends Transform implements AnimationTarget {
        /** Source data: axis */
        axis: BABYLON.Vector3 = new BABYLON.Vector3;
        /** Source data: angle */
        radians: number;
        constructor(transform: NodeTransform) {
            super(transform, 4, 1);
            this.axis = new BABYLON.Vector3;
            this.radians = 0;
            this.updateFromData();
        }
        updateFromData() {
            this.axis.set(this.data[0], this.data[1], this.data[2]);
            this.radians = this.data[3] / 180 * Math.PI;
        }
        applyTransformation(mat: BABYLON.Matrix) {
            let t = BABYLON.Matrix.RotationAxis(this.axis, this.radians);
            mat.copyFrom(mat.multiply(t));
        }
        hasTransformType(type: TransformType): boolean {
            return (type === TransformType.Rotation);
        }
    }

    export class TransformTranslate extends Transform implements AnimationTarget {
        /** Source data: translation */
        pos: BABYLON.Vector3 = new BABYLON.Vector3();
        constructor(transform: NodeTransform) {
            super(transform, 3, 1);
            this.updateFromData();
        }
        updateFromData() {
            this.pos.set(this.data[0], this.data[1], this.data[2]);
        }
        applyTransformation(mat: BABYLON.Matrix) {
            let t = BABYLON.Matrix.Translation(this.pos.x, this.pos.y, this.pos.z);
            mat.copyFrom(mat.multiply(t));
        }
        hasTransformType(type: TransformType): boolean {
            return (type === TransformType.Translation);
        }
    }

    export class TransformScale extends Transform implements AnimationTarget {
        /** Source data: scaling */
        scl: BABYLON.Vector3 = new BABYLON.Vector3();
        constructor(transform: NodeTransform) {
            super(transform, 3, 1);
            this.updateFromData();
        }
        updateFromData() {
            this.scl.set(this.data[0], this.data[1], this.data[2]);
        }
        applyTransformation(mat: BABYLON.Matrix) {
            let t = BABYLON.Matrix.Scaling(this.scl.x, this.scl.y, this.scl.z);
            mat.copyFrom(mat.multiply(t))
        }
        hasTransformType(type: TransformType): boolean {
            return (type === TransformType.Scale);
        }
    }
