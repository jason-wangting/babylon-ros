import {Context} from "../context"
import {Log, LogLevel} from "../log"


import * as Utils from "./utils"
import * as MathUtils from "../math"
import {Material} from "./material"
import {Texture} from "./texture"
import {Animation, AnimationTarget} from "./animation"
import * as COLLADAContext from "../context"
import {Options} from "./options"
import {BoundingBox} from "./bounding_box"
import * as BABYLON from 'babylonjs';
import { InstanceController } from "../loader/instance_controller"
import { InstanceGeometry } from "../loader/instance_geometry"
import { NodeTransform } from "../loader/node_transform"
import { VisualSceneNode } from "../loader/visual_scene_node"
import { ConverterContext } from "./context"
import { Transform, TransformMatrix, TransformRotate, TransformTranslate, TransformScale } from "./transform"
import {Geometry} from "./geometry"

    export class Node {
        name: string;
        parent: Node | undefined;
        children: Node[];
        geometries: Geometry[];
        transformations: Transform[];
        transformation_pre: BABYLON.Matrix = new BABYLON.Matrix();
        transformation_post: BABYLON.Matrix = new BABYLON.Matrix();
        matrix: BABYLON.Matrix = new BABYLON.Matrix();
        worldMatrix: BABYLON.Matrix = new BABYLON.Matrix();
        initialLocalMatrix: BABYLON.Matrix = new BABYLON.Matrix();
        initialWorldMatrix: BABYLON.Matrix = new BABYLON.Matrix();

        constructor() {
            this.name = "";
            this.children = [];
            this.geometries = [];
            this.transformations = [];
            this.transformation_pre = BABYLON.Matrix.Identity();
            this.transformation_post = BABYLON.Matrix.Identity()
        }

        addTransform(mat: BABYLON.Matrix) {
            var loader_transform = new NodeTransform();
            loader_transform.data = new Float32Array();
            mat.copyToArray(loader_transform.data);
            loader_transform.type = "matrix";
            loader_transform.name = "virtual static transform";
            var transform = new TransformMatrix(loader_transform);
            this.transformations.unshift(transform);
        }

        /**
        * Returns the world transformation matrix of this node
        */
        getWorldMatrix(context: ConverterContext): BABYLON.Matrix {
            if (this.parent != null) {
                this.worldMatrix = this.parent.getWorldMatrix(context).multiply(this.getLocalMatrix(context));
            } else {
                this.worldMatrix.copyFrom(this.getLocalMatrix(context));
            }
            return this.worldMatrix;
        }

        /**
        * Returns the local transformation matrix of this node
        */
        getLocalMatrix(context: ConverterContext) {
            
            // Static pre-transform
            this.matrix.copyFrom(this.transformation_pre);

            // Original transformations
            for (var i: number = 0; i < this.transformations.length; i++) {
                var transform: Transform = this.transformations[i];
                transform.applyTransformation(this.matrix);
            }

            // Static post-transform
           this.matrix = this.matrix.multiply(this.transformation_post);

            return this.matrix;
        }

        /**
        * Returns true if this node contains any scene graph items (geometry, lights, cameras, ...)
        */
        containsSceneGraphItems(): boolean {
            if (this.geometries.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        /**
        * Returns whether there exists any animation that targets the transformation of this node
        */
        isAnimated(recursive: boolean): boolean {
            return this.isAnimatedBy(undefined, recursive);
        }

        /**
        * Returns whether there the given animation targets the transformation of this node
        */
        isAnimatedBy(animation: Animation, recursive: boolean): boolean {

            for (var i: number = 0; i < this.transformations.length; i++) {
                var transform: Transform = this.transformations[i];
                if (transform.isAnimatedBy(animation)) return true;
            }
            if (recursive && this.parent) {
                return this.parent.isAnimatedBy(animation, recursive);
            }
            return false;
        }

        resetAnimation(): void {
            for (var i: number = 0; i < this.transformations.length; i++) {
                var transform: Transform = this.transformations[i];
                transform.resetAnimation();
            }
        }

        /**
        * Removes all nodes from that list that are not relevant for the scene graph
        */
        static pruneNodes(nodes: Node[], context: Context) {
            // Prune all children recursively
            for (var n: number = 0; n < nodes.length; ++n) {
                var node: Node = nodes[n];
                Node.pruneNodes(node.children, context);
            }

            // Remove all nodes from the list that are not relevant
            nodes = nodes.filter((value: Node, index: number, array: Node[]) =>
                (value.containsSceneGraphItems() || value.children.length > 0));
        }

        /**
        * Recursively creates a converter node tree from the given collada node root node
        */
        static createNode(node: VisualSceneNode, parent: Node, context: ConverterContext): Node {
            // Create new node
            var converterNode: Node = new Node();
            converterNode.parent = parent;
            if (parent) {
                parent.children.push(converterNode);
            }
            context.nodes.register(node, converterNode);

            converterNode.name = node.name || node.id || node.sid || "Unnamed node";

            // Node transform
            for (var i = 0; i < node.transformations.length; ++i) {
                var transform: NodeTransform = node.transformations[i];
                var converterTransform: Transform = null;
                switch (transform.type) {
                    case "matrix":
                        converterTransform = new TransformMatrix(transform);
                        break;
                    case "rotate":
                        converterTransform = new TransformRotate(transform);
                        break;
                    case "translate":
                        converterTransform = new TransformTranslate(transform);
                        break;
                    case "scale":
                        converterTransform = new TransformScale(transform);
                        break;
                    default:
                        context.log.write("Transformation type " + transform.type + " not supported, transform ignored", LogLevel.Warning);
                }
                if (converterTransform !== null) {
                    context.animationTargets.register(transform, converterTransform);
                    converterNode.transformations.push(converterTransform);
                }
            }

            Node.updateInitialMatrices(converterNode, context);
            
            // Create children
            for (var i: number = 0; i < node.children.length; i++) {
                var colladaChild: VisualSceneNode = node.children[i];
                var converterChild: Node = Node.createNode(colladaChild, converterNode, context);
            }

            return converterNode;
        }

        static updateInitialMatrices(node: Node, context: ConverterContext) {
            node.getLocalMatrix(context);
            node.initialLocalMatrix.copyFrom(node.matrix);

            node.getWorldMatrix(context);
            node.initialWorldMatrix.copyFrom(node.worldMatrix);
        }

        static createNodeData(converter_node: Node, context: ConverterContext) {

            var collada_node: VisualSceneNode = context.nodes.findCollada(converter_node);

            // Static geometries (<instance_geometry>)
            for (var i: number = 0; i < collada_node.geometries.length; i++) {
                var loaderGeometry: InstanceGeometry = collada_node.geometries[i];
                var converterGeometry: Geometry = Geometry.createStatic(loaderGeometry, converter_node, context);
                converter_node.geometries.push(converterGeometry);
            }

            // Animated geometries (<instance_controller>)
            for (var i: number = 0; i < collada_node.controllers.length; i++) {
                var loaderController: InstanceController = collada_node.controllers[i];
                var converterGeometry: Geometry = Geometry.createAnimated(loaderController, converter_node, context);
                converter_node.geometries.push(converterGeometry);
            }

            // Lights, cameras
            if (collada_node.lights.length > 0) {
                context.log.write("Node " + collada_node.id + " contains lights, lights are ignored", LogLevel.Warning);
            }
            if (collada_node.cameras.length > 0) {
                context.log.write("Node " + collada_node.id + " contains cameras, cameras are ignored", LogLevel.Warning);
            }

            // Children
            for (var i: number = 0; i < converter_node.children.length; i++) {
                var child: Node = converter_node.children[i];
                Node.createNodeData(child, context);
            }
        }

        /**
        * Calls the given function for all given nodes and their children (recursively)
        */
        static forEachNode(nodes: Node[], fn: (node: Node) => void) {

            for (var i: number = 0; i < nodes.length; ++i) {
                var node: Node = nodes[i];
                fn(node);
                Node.forEachNode(node.children, fn);
            }
        }

        /**
        * Extracts all geometries in the given scene and merges them into a single geometry.
        * The geometries are detached from their original nodes in the process.
        */
        static extractGeometries(scene_nodes: Node[], context: ConverterContext): Geometry[] {

            // Collect all geometries and the corresponding nodes
            // Detach geometries from nodes in the process
            var result: { node: Node; geometry: Geometry }[] = [];
            Node.forEachNode(scene_nodes, (node) => {
                for (var i: number = 0; i < node.geometries.length; ++i) {
                    result.push({ node: node, geometry: node.geometries[i] });
                }
                node.geometries = [];
            });

            if (result.length === 0) {
                context.log.write("No geometry found in the scene, returning an empty geometry", LogLevel.Warning);
                var geometry: Geometry = new Geometry();
                geometry.name = "empty_geometry";
                return [geometry];
            }

            // Check whether the geometries need a skeleton
            var skinnedGeometries: number = 0;
            var animatedNodeGeometries: number = 0;
            result.forEach((element) => {
                if (element.geometry.getSkeleton() !== null) skinnedGeometries++; 
                if (element.node.isAnimated(true)) animatedNodeGeometries++;
            });

            if (!context.options.createSkeleton.value) {
                if (skinnedGeometries > 0) {
                    context.log.write("Scene contains " + skinnedGeometries + " skinned geometries, but skeleton creation is disabled. Static geometry was generated.", LogLevel.Warning);
                }
                if (animatedNodeGeometries > 0) {
                    context.log.write("Scene contains " + animatedNodeGeometries + " static geometries attached to animated nodes, but skeleton creation is disabled. Static geometry was generated.", LogLevel.Warning);
                }
                // Apply the node transformation to static geometries
                result.forEach((element) => {
                    var world_matrix = element.node.getWorldMatrix(context);
                    if (context.options.worldTransformUnitScale) {
                        var mat: BABYLON.Matrix = new BABYLON.Matrix()
                        mat = BABYLON.Matrix.Invert(element.node.transformation_post);
                        world_matrix = world_matrix.multiply(mat);
                    }
                    Geometry.transformGeometry(element.geometry, world_matrix, context);
                });
            }

            // Merge all geometries
            if (context.options.singleGeometry) {
                var geometries = result.map((element) => { return element.geometry });
                var geometry: Geometry = Geometry.mergeGeometries(geometries, context);
                return [geometry];
            } else {
                return result.map((element) => { return element.geometry });
            }
        }

        static setupWorldTransform(node: Node, context: ConverterContext) {
            var worldInvScale: BABYLON.Vector3 = Utils.getWorldInvScale(context);
            var worldTransform: BABYLON.Matrix = Utils.getWorldTransform(context);

            var uniform_scale: boolean = context.options.worldTransformUnitScale.value;

            // Pre-transformation
            // Root nodes: the world transformation
            // All other nodes: undo whatever post-transformation the parent has added
            if (node.parent == null) {  
                node.transformation_pre.copyFrom(worldTransform);
            } else if (uniform_scale) {
                node.transformation_pre = BABYLON.Matrix.Invert(node.parent.transformation_post);
            }

            // Post-transformation
            if (uniform_scale) {
                // This way, the node transformation will not contain any scaling
                // Only the translation part will be scaled
                node.transformation_post = BABYLON.Matrix.Scaling(worldInvScale.x, worldInvScale.y, worldInvScale.z);
            }

            Node.updateInitialMatrices(node, context);

            // Recursively set up children
            for (var i = 0; i < node.children.length; ++i) {
                Node.setupWorldTransform(node.children[i], context);
            }
        }
    }
