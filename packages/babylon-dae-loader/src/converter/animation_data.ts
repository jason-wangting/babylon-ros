import {Context} from "../context"
import {LogLevel} from "../log"
import {Animation, AnimationTarget, AnimationTimeStatistics, Statistics} from "./animation"
import * as Utils from "./utils"
import * as MathUtils from "../math"
import * as BABYLON from "babylonjs";
import { AnimationChannel } from "./animation_channel"
import { ConverterContext } from "./context"
import { Skeleton } from "./skeleton"
import { Bone } from "./bone"

    export interface AnimationLabel {
        name: string;
        begin: number;
        end: number;
        fps: number;
    }

    export class AnimationDataTrack {
        /** Position (relative to parent) */
        pos: Float32Array = new Float32Array();
        /** Rotation (relative to parent) */
        rot: Float32Array = new Float32Array();
        /** Scale (relative to parent) */
        scl: Float32Array = new Float32Array();
        /** Position (relative to rest pose) */
        rel_pos: Float32Array = new Float32Array();
        /** Rotation (relative to rest pose) */
        rel_rot: Float32Array = new Float32Array();
        /** Scale (relative to rest pose) */
        rel_scl: Float32Array = new Float32Array();

        constructor() {
        }
    }

    function logStatistics(name: string, stat: Statistics, precision: number, context: Context): void {
        context.log.write(name + ": "
            + stat.mean().toFixed(precision)
            + " ("
            + "min: " + stat.min().toFixed(precision)
            + ", "
            + "med: " + stat.median().toFixed(precision)
            + ", "
            + "max: " + stat.max().toFixed(precision)
            + ")",
            LogLevel.Debug);
    };

    export class AnimationData {
        name: string;
        duration: number = 0;
        keyframes: number = 0;
        fps: number = 0;
        original_fps: number = 0;
        tracks: AnimationDataTrack[];

        constructor() {
            this.name = "";
            this.tracks = [];
        }

        static create(skeleton: Skeleton, animation: Animation, index_begin: number, index_end: number, fps: number, context: ConverterContext): AnimationData {
            var result: AnimationData = new AnimationData();
            result.name = animation.name;

            var src_channels: AnimationChannel[] = animation.channels;

            // Get timeline statistics
            var stat: AnimationTimeStatistics = new AnimationTimeStatistics();
            Animation.getTimeStatistics(animation, index_begin, index_end, stat, context);


            logStatistics("Original Duration", stat.duration, 3, context);
            logStatistics("Original Time Start", stat.beginTime, 3, context);
            logStatistics("Original Time Stop", stat.endTime, 3, context);
            logStatistics("Original Keyframes", stat.keyframes, 3, context);
            logStatistics("Original FPS", stat.fps, 3, context);

            // Default fps if none give: median fps of source data
            if (!fps) {
                fps = stat.fps.median();
            }
            if (!fps || fps <= 0) {
                context.log.write("Could not determine FPS for animation, skipping animation", LogLevel.Warning);
                return result;
            }

            // Duration (in seconds)
            var start_time: number = stat.beginTime.min();
            var end_time: number = stat.endTime.max();
            var duration: number = end_time - start_time;

            // Keyframes
            var keyframes: number = Math.max(Math.floor(fps * duration + 1e-4) + 1, 2);
            if (context.options.truncateResampledAnimations.value) {
                // Truncate duration, so that FPS is consistent with "keyframes/duration"
                duration = (keyframes - 1) / fps;
            } else {
                // Stretch FPS, so that FPS is consistent with "keyframes/duration"
                fps = (keyframes - 1) / duration;
            }
            var spf: number = 1 / fps;

            context.log.write("Resampled duration: " + duration.toFixed(3), LogLevel.Debug);
            context.log.write("Resampled keyframes: " + keyframes.toFixed(3), LogLevel.Debug);
            context.log.write("Resampled FPS: " + fps.toFixed(3), LogLevel.Debug);

            // Store fps
            result.fps = +fps.toFixed(3);
            result.keyframes = keyframes;
            result.duration = duration;
            result.original_fps = stat.fps.median();

            if (!(fps > 0)) {
                context.log.write("Invalid FPS: " + fps + ", skipping animation", LogLevel.Warning);
                return result;
            }
            if (!(duration > 0)) {
                context.log.write("Invalid duration: " + duration + ", skipping animation", LogLevel.Warning);
                return result;
            }
            if (!(keyframes > 0)) {
                context.log.write("Invalid number of keyframes: " + keyframes + ", skipping animation", LogLevel.Warning);
                return result;
            }

            // Init result
            for (var i: number = 0; i < skeleton.bones.length; ++i) {
                var bone: Bone = skeleton.bones[i];
                var track: AnimationDataTrack = new AnimationDataTrack();

                track.pos = new Float32Array(keyframes * 3);
                track.rot = new Float32Array(keyframes * 4);
                track.scl = new Float32Array(keyframes * 3);

                track.rel_pos = new Float32Array(keyframes * 3);
                track.rel_rot = new Float32Array(keyframes * 4);
                track.rel_scl = new Float32Array(keyframes * 3);

                result.tracks.push(track);
            }
            var result_tracks: AnimationDataTrack[] = result.tracks;

            // Reset the bone poses
            for (var i: number = 0; i < skeleton.bones.length; ++i) {
                var bone: Bone = skeleton.bones[i];
                bone.node.resetAnimation();
            }

            // Process all keyframes
            var pos = new BABYLON.Vector3();
            var rot = new BABYLON.Quaternion();
            var scl = new BABYLON.Vector3();
            for (var k: number = 0; k < keyframes; ++k) {
                var time: number = start_time + k * spf;

                // Apply all channels to the scene nodes
                // This might be expensive as it resamples the animation
                for (var c: number = 0; c < src_channels.length; ++c) {
                    var channel: AnimationChannel = src_channels[c];
                    if (channel) {
                        channel.target.applyAnimation(channel, time, context);
                    }
                }

                // Extract bone poses
                for (var b: number = 0; b < skeleton.bones.length; ++b) {
                    var bone: Bone = skeleton.bones[b];
                    var track: AnimationDataTrack = result_tracks[b];

                    var mat: BABYLON.Matrix = bone.node.getLocalMatrix(context);
                    mat.decompose(scl, rot, pos);
                    
                    if (track.pos !== null) {
                        track.pos[k * 3 + 0] = pos.x;
                        track.pos[k * 3 + 1] = pos.y;
                        track.pos[k * 3 + 2] = pos.z;
                    }
                    if (track.rot !== null) {
                        track.rot[k * 4 + 0] = rot.x;
                        track.rot[k * 4 + 1] = rot.y;
                        track.rot[k * 4 + 2] = rot.z;
                        track.rot[k * 4 + 3] = rot.w;
                    }
                    if (track.scl !== null) {
                        track.scl[k * 3 + 0] = scl.x;
                        track.scl[k * 3 + 1] = scl.y;
                        track.scl[k * 3 + 2] = scl.z;
                    }
                }
            }

            // Reset the bone poses
            for (var i: number = 0; i < skeleton.bones.length; ++i) {
                var bone: Bone = skeleton.bones[i];
                bone.node.resetAnimation();
            }

            // Remove unnecessary tracks
            var output_relative: boolean = false;
            var pos0 = new BABYLON.Vector3()
            var inv_pos0 = new BABYLON.Vector3()
            var rot0 = new BABYLON.Quaternion();
            var inv_rot0 = new BABYLON.Quaternion();
            var scl0 = new BABYLON.Vector3()
            var inv_scl0 = new BABYLON.Vector3()
            for (var b: number = 0; b < skeleton.bones.length; ++b) {
                var bone: Bone = skeleton.bones[b];
                var track: AnimationDataTrack = result_tracks[b];

                // Get rest pose transformation of the current bone
                var mat0 = bone.node.getLocalMatrix(context);
                mat0.decompose(scl0, rot0, pos0);

                inv_rot0 = rot0.invert();
                inv_pos0 = pos0.negate();

                inv_scl0.set(1 / scl0.x, 1 / scl0.y, 1 / scl0.z);

                // Check whether there are any changes to the rest pose
                var pos_change: number = 0;
                var rot_change: number = 0;
                var scl_change: number = 0;
                var max_pos_change: number = 0; // max length
                var max_rot_change: number = 0; // max rotation angle (in radians)
                var max_scl_change: number = 0; // max scale along any axis

                for (var k: number = 0; k < keyframes; ++k) {

                    // Relative position
                    pos.x = track.pos[k * 3 + 0];
                    pos.y = track.pos[k * 3 + 1];
                    pos.z = track.pos[k * 3 + 2];
                    pos.addInPlace(inv_pos0);
                    pos_change = pos.length();
                    max_pos_change = Math.max(max_pos_change, pos_change);

                    // Relative rotation
                    rot.x = track.rot[k * 4 + 0];
                    rot.y = track.rot[k * 4 + 1];
                    rot.z = track.rot[k * 4 + 2];
                    rot.w = track.rot[k * 4 + 3];
                    rot.multiply(inv_rot0);
                    rot_change = 2 * Math.acos(Math.min(Math.max(rot.w, -1), 1));
                    max_rot_change = Math.max(max_rot_change, rot_change);

                    // Relative scale
                    scl.x = track.scl[k * 3 + 0];
                    scl.y = track.scl[k * 3 + 1];
                    scl.z = track.scl[k * 3 + 2];
                    scl.multiplyInPlace(inv_scl0);
                    scl_change = Math.max(Math.abs(1 - scl.x), Math.abs(1 - scl.y), Math.abs(1 - scl.z));
                    max_scl_change = Math.max(max_scl_change, scl_change);

                    // Store relative transformations
                    track.rel_pos[k * 3 + 0] = pos.x;
                    track.rel_pos[k * 3 + 1] = pos.y;
                    track.rel_pos[k * 3 + 2] = pos.z;

                    track.rel_scl[k * 3 + 0] = scl.x;
                    track.rel_scl[k * 3 + 1] = scl.y;
                    track.rel_scl[k * 3 + 2] = scl.z;

                    track.rel_rot[k * 4 + 0] = rot.x;
                    track.rel_rot[k * 4 + 1] = rot.y;
                    track.rel_rot[k * 4 + 2] = rot.z;
                    track.rel_rot[k * 4 + 3] = rot.w;
                }

                // Delete tracks that do not contain any animation
                if (context.options.removeConstAnimationTracks.value === true) {
                    // TODO: This needs better tolerances.
                    // TODO: Maybe use relative instead of absolute tolerances?
                    // TODO: For COLLADA files that use matrix animations, the decomposition will have low precision
                    // TODO: and scale will have an absolute error of >1e-2 even if the scale never changes in the original modelling application.
                    var tol_pos: number = 1e-4;
                    var tol_rot: number = 0.05; // 0.05 radians (2.86 degrees) rotation
                    var tol_scl: number = 0.5; // 5% scaling
                    if (max_pos_change < tol_pos) {
                        track.pos = new Float32Array();
                        track.rel_pos = new Float32Array();
                    }
                    if (max_rot_change < tol_rot) {
                        track.rot = new Float32Array();
                        track.rel_rot = new Float32Array();
                    }
                    if (max_scl_change < tol_scl) {
                        track.scl = new Float32Array();
                        track.rel_scl = new Float32Array();
                    }
                }
            }

            return result;
        }

        static createFromLabels(skeleton: Skeleton, animation: Animation,
            labels: AnimationLabel[], defaultFps: number, context: ConverterContext): AnimationData[]{

            if (!skeleton) {
                context.log.write("No skeleton present, no animation data generated.", LogLevel.Warning);
                return [];
            }

            var result: AnimationData[] = [];

            for (var i: number = 0; i < labels.length; ++i) {
                var label: AnimationLabel = labels[i];
                var data: AnimationData = AnimationData.create(skeleton, animation, label.begin, label.end, label.fps || defaultFps, context);
                if (data !== null) {
                    data.name = label.name;
                    result.push(data);
                }
            }

            return result;
        }
    }
