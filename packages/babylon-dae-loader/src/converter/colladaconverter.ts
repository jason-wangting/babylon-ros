import { promises as fs } from 'fs';
import {RMXModelLoader} from "../model-loader"
import {RMXModel} from "../model"
import * as Utils from "./utils"
import {Log, LogLevel, LogConsole, LogCallback, LogFilter} from "../log"
import { VisualScene } from '../loader/visual_scene';
import { VisualSceneNode } from '../loader/visual_scene_node';
import { AnimationData, AnimationLabel } from './animation_data';
import { Animation } from './animation';
import * as LoaderAnimation from '../loader/animation';
import { ConverterContext } from './context';
import { GeometryChunk } from './geometry_chunk';
import { Geometry } from './geometry';
import { Options } from './options';
import {Node} from "./node"
import {Document} from "./file"
import * as LoaderDocument from "../loader/document"

export class ColladaConverter {
    log: Log;
    options: Options;

    constructor() {
        this.log = new LogConsole();
        this.options = new Options();
    }

    private forEachGeometry(doc: Document, fn: (geometry: Geometry) => void): void {
        for (var i: number = 0; i < doc.geometries.length; ++i) {
            fn(doc.geometries[i]);
        }
        Node.forEachNode(doc.nodes, (node: Node) => {
            for (var i: number = 0; i < node.geometries.length; ++i) {
                fn(node.geometries[i]);
            }
        });
    }

    convert(doc: LoaderDocument.Document): Document {
        var context: ConverterContext = new ConverterContext(this.log, this.options);

        if (!doc) {
            context.log.write("No document to convert", LogLevel.Warning);
            return null;
        }

        var result = new Document();

        // Scene nodes
        result.nodes = ColladaConverter.createScene(doc, context);

        // Set up the world transform
        if (context.options.worldTransform.value) {

            // Add the world transform to scene nodes
            for (var i: number = 0; i < result.nodes.length; ++i) {
                Node.setupWorldTransform(result.nodes[i], context);
            }

            // Adapt inverse bind matrices
            this.forEachGeometry(result, (geometry) => {
                Geometry.setupWorldTransform(geometry, context);
            });

            // Bake: Apply the world transform to skinned geometries
            if (context.options.worldTransformBake.value) {
                var mat = Utils.getWorldTransform(context);
                this.forEachGeometry(result, (geometry) => {
                    if (geometry.getSkeleton() !== null) {
                        Geometry.transformGeometry(geometry, mat, context);
                    }
                });
            }
        }

        // Original animations curves
        if (context.options.enableAnimations.value === true) {
            result.animations = ColladaConverter.createAnimations(doc, context);
        }

        // Extract geometries
        if (context.options.enableExtractGeometry.value === true) {
            result.geometries = Node.extractGeometries(result.nodes, context);
        }

        // Merge chunk data
        if (context.options.singleBufferPerGeometry.value === true) {
            this.forEachGeometry(result, (geometry) => {
                GeometryChunk.mergeChunkData(geometry.chunks, context);
            });
        }

        // Resampled animations
        if (context.options.enableResampledAnimations.value === true) {
            result.resampled_animations = ColladaConverter.createResampledAnimations(doc, result, context);
        }

        // Compute bounding boxes
        Node.forEachNode(result.nodes, (node: Node) => {
            this.forEachGeometry(result, (geometry) => {
                Geometry.computeBoundingBox(geometry, context);
            });
        });

        return result;
    }

    static createScene(doc: LoaderDocument.Document, context: ConverterContext): Node[] {
        var result: Node[] = [];

        // Get the COLLADA scene
        if (!doc.scene) {
            context.log.write("Collada document has no scene", LogLevel.Warning);
            return result;
        }
        var scene: VisualScene = VisualScene.fromLink(doc.scene.instance, context);
        if (!scene) {
            context.log.write("Collada document has no scene", LogLevel.Warning);
            return result;
        }

        // Create converted nodes
        for (var i: number = 0; i < scene.children.length; ++i) {
            var topLevelNode: VisualSceneNode = scene.children[i];
            result.push(Node.createNode(topLevelNode, null, context));
        }

        // Create data (geometries, ...) for the converted nodes
        for (var i: number = 0; i < result.length; ++i) {
            var node: Node = result[i];
            Node.createNodeData(node, context);
        }

        return result;
    }

    static createAnimations(doc: LoaderDocument.Document, context: ConverterContext): Animation[] {
        var result: Animation[] = [];

        // Create converted animations
        for (var i: number = 0; i < doc.libAnimations.children.length; ++i) {
            var animation = doc.libAnimations.children[i];
            result.push(Animation.create(animation, context));
        }

        // If requested, create a single animation
        if (context.options.singleAnimation.value === true && result.length > 1) {
            var topLevelAnimation = new Animation();
            topLevelAnimation.id = "";
            topLevelAnimation.name = "animation";

            // Steal all channels from previous animations
            for (var i: number = 0; i < result.length; ++i) {
                var child: Animation = result[i];
                topLevelAnimation.channels = topLevelAnimation.channels.concat(child.channels);
                child.channels = [];
            }
            result = [topLevelAnimation];
        }

        return result;
    }

    static createResampledAnimations(doc: LoaderDocument.Document, file: Document, context: ConverterContext): AnimationData[] {
        var result: AnimationData[] = [];
        if (file.animations.length === 0) {
            // context.log.write("No original animations available, no resampled animations generated.", LogLevel.Warning);
            return [];
        }

        // Get the geometry
        if (file.geometries.length > 1) {
            context.log.write("Converted document contains multiple geometries, resampled animations are only generated for single geometries.", LogLevel.Warning);
            return [];
        }
        if (file.geometries.length === 0) {
            context.log.write("Converted document does not contain any geometries, no resampled animations generated.", LogLevel.Warning);
            return [];
        }
        var geometry: Geometry = file.geometries[0];

        // Process all animations in the document
        var fps: number = +context.options.animationFps.value;
        for (var i: number = 0; i < file.animations.length; ++i) {
            var animation: Animation = file.animations[i];

            if (context.options.useAnimationLabels.value === true) {
                var labels: AnimationLabel[] = context.options.animationLabels.value;
                var datas: AnimationData[] = AnimationData.createFromLabels(geometry.getSkeleton(), animation, labels, fps, context);
                result = result.concat(datas);
            } else {
                var data: AnimationData = AnimationData.create(geometry.getSkeleton(), animation, null, null, fps, context);
                if (data !== null) {
                    result.push(data);
                }
            }
        }

        return result;
    }
}
