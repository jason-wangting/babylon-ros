import {Log, LogLevel} from "../log"

import * as SourceLoader from "../loader/source"

import * as Utils from "./utils"
import * as MathUtils from "../math"
import {Material, MaterialMap} from "./material"
import {Texture} from "./texture"
import {AnimationTarget} from "./animation"
import * as COLLADAContext from "../context"
import * as BABYLON from "babylonjs"
import {Options} from "./options"
import {BoundingBox} from "./bounding_box"
import { Controller } from "../loader/controller"
import { Input } from "../loader/input"
import { InstanceController } from "../loader/instance_controller"
import { InstanceGeometry } from "../loader/instance_geometry"
import { InstanceMaterial } from "../loader/instance_material"
import { Joints } from "../loader/joints"
import { Link } from "../loader/link"
import { Skin } from "../loader/skin"
import { Skeleton } from "../converter/skeleton"
import { Triangles } from "../loader/triangles"
import { VisualSceneNode } from "../loader/visual_scene_node"
import { ConverterContext } from "./context"
import { Node } from "./node"
import { GeometryChunk, GeometryData, GeometryChunkSourceIndices } from "./geometry_chunk"
import * as LoaderGeometry from "../loader/geometry"

    export class Geometry {
        name: string;
        chunks: GeometryChunk[];
        private skeleton: Skeleton | undefined ;
        boundingBox: BoundingBox;

        constructor() {
            this.name = "";
            this.chunks = [];
            this.boundingBox = new BoundingBox();
        }

        getSkeleton(): Skeleton | undefined{
            return this.skeleton;
        }

        /**
        * Creates a static (non-animated) geometry
        */
        static createStatic(instanceGeometry: InstanceGeometry, node: Node, context: ConverterContext): Geometry | undefined{
            if (!instanceGeometry || !instanceGeometry.geometry) {
                return undefined;
            }
            var geometry = LoaderGeometry.Geometry.fromLink(instanceGeometry.geometry, context);
            if (!geometry) {
                context.log.write("Geometry instance has no geometry, mesh ignored", LogLevel.Warning);
                return undefined;
            }

            var result = Geometry.createGeometry(geometry, instanceGeometry.materials, context);
            if (context.options.createSkeleton.value) {
                Geometry.addSkeleton(result, node, context);
            }
            return result;
        }

        /**
        * Creates an animated (skin or morph) geometry
        */
        static createAnimated(instanceController: InstanceController, node: Node, context: ConverterContext): Geometry | undefined{
            if (!instanceController || !instanceController.controller) {
                return undefined;
            }
            var controller = Controller.fromLink(instanceController.controller, context);
            if (!controller) {
                context.log.write("Controller instance has no controller, mesh ignored", LogLevel.Warning);
                return undefined;
            }

            if (controller.skin !== null) {
                return Geometry.createSkin(instanceController, controller, context);
            } else if (controller.morph !== null) {
                return Geometry.createMorph(instanceController, controller, context);
            }

            return undefined;
        }

        /**
        * Creates a skin-animated geometry
        */
        static createSkin(instanceController: InstanceController, controller: Controller, context: ConverterContext): Geometry | undefined{
            if (!instanceController || !instanceController.controller) {
                return undefined;
            }
            // Controller element
            var controller = Controller.fromLink(instanceController.controller, context) as Controller;
            if (!controller) {
                context.log.write("Controller instance has no controller, mesh ignored", LogLevel.Error);
                return undefined;
            }

            // Skin element
            var skin = controller.skin;
            if (!skin || !skin.source) {
                context.log.write("Controller has no skin, mesh ignored", LogLevel.Error);
                return undefined;
            }

            // Geometry element
            var loaderGeometry = LoaderGeometry.Geometry.fromLink(skin.source, context);
            if (!loaderGeometry) {
                context.log.write("Controller has no geometry, mesh ignored", LogLevel.Error);
                return undefined;
            }

            // Create skin geometry
            var geometry: Geometry = Geometry.createGeometry(loaderGeometry, instanceController.materials, context);

            if (!context.options.createSkeleton.value) {
                context.log.write("Geometry " + geometry.name + " contains skinning data, but the creation of skeletons is disabled in the options. Using static geometry only.", LogLevel.Warning);
                return geometry;
            }

            // Find skeleton root nodes
            var skeletonRootNodes = Geometry.getSkeletonRootNodes(instanceController.skeletons, context);
            if (skeletonRootNodes.length === 0) {
                context.log.write("Controller still has no skeleton, using unskinned geometry", LogLevel.Warning);
                return geometry;
            }

            // Joints
            var jointsElement: Joints | undefined = skin.joints;
            if (!jointsElement) {
                context.log.write("Skin has no joints element, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            var jointsInput: Input | undefined = jointsElement.joints;
            if (!jointsInput || !jointsInput.source) {
                context.log.write("Skin has no joints input, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            var jointsSource: SourceLoader.Source | undefined = SourceLoader.Source.fromLink(jointsInput.source, context);
            if (!jointsSource) {
                context.log.write("Skin has no joints source, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            var jointSids: string[] = <string[]>jointsSource.data;

            // Bind shape matrix
            var bindShapeMatrix: BABYLON.Matrix = new BABYLON.Matrix();
            if (skin.bindShapeMatrix !== null) {
                MathUtils.mat4Extract(skin.bindShapeMatrix, 0, bindShapeMatrix);
            }

            // InvBindMatrices
            var invBindMatricesInput: Input | undefined = jointsElement?.invBindMatrices;
            if (!invBindMatricesInput || !invBindMatricesInput.source) {
                context.log.write("Skin has no inverse bind matrix input, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            var invBindMatricesSource = SourceLoader.Source.fromLink(invBindMatricesInput.source, context);
            if (!invBindMatricesSource) {
                context.log.write("Skin has no inverse bind matrix source, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            if ((!invBindMatricesSource.data || !jointsSource.data) ||
                 invBindMatricesSource.data.length !== jointsSource.data.length * 16) {
                context.log.write("Skin has an inconsistent length of joint data sources, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            if (!(invBindMatricesSource.data instanceof Float32Array)) {
                context.log.write("Skin inverse bind matrices data does not contain floating point data, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            var invBindMatrices: Float32Array = <Float32Array> invBindMatricesSource.data;

            // Vertex weights
            var weightsElement = skin.vertexWeights;
            if (!weightsElement) {
                context.log.write("Skin contains no bone weights element, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            var weightsInput = weightsElement.weights;
            if (!weightsInput || !weightsInput.source) {
                context.log.write("Skin contains no bone weights input, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            var weightsSource = SourceLoader.Source.fromLink(weightsInput.source, context);
            if (!weightsSource) {
                context.log.write("Skin has no bone weights source, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            if (!(weightsSource.data instanceof Float32Array)) {
                context.log.write("Bone weights data does not contain floating point data, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            var weightsData: Float32Array = <Float32Array> weightsSource.data;

            // Indices
            if (skin?.vertexWeights?.joints?.source?.url !== skin?.joints?.joints?.source?.url) {
                // Holy crap, how many indirections does this stupid format have?!?
                // If the data sources differ, we would have to reorder the elements of the "bones" array.
                context.log.write("Skin uses different data sources for joints in <joints> and <vertex_weights>, this is not supported. Using unskinned mesh.", LogLevel.Warning);
                return geometry;
            }

            // Bones
            var skeleton = Skeleton.createFromSkin(jointSids, skeletonRootNodes, bindShapeMatrix, invBindMatrices, context);
            if (skeleton.bones.length === 0) {
                context.log.write("Skin contains no bones, using unskinned mesh", LogLevel.Warning);
                return geometry;
            }
            Geometry.setSkeleton(geometry, skeleton, context);

            // Compact skinning data
            var bonesPerVertex = 4;
            var skinningData = Geometry.compactSkinningData(skin, weightsData, bonesPerVertex, context);
            var skinIndices = skinningData.indices;
            var skinWeights = skinningData.weights;

            // Distribute skin data to chunks
            for (var i = 0; i < geometry.chunks.length; ++i) {
                var chunk: GeometryChunk = geometry.chunks[i];
                var chunkData: GeometryData = chunk.data;
                var chunkSrcIndices: GeometryChunkSourceIndices = chunk._colladaIndices;

                // Distribute indices to chunks
                chunkData.boneindex = new Uint8Array(chunk.vertexCount * bonesPerVertex);
                Utils.reIndex(skinIndices, chunkSrcIndices.indices, chunkSrcIndices.indexStride, chunkSrcIndices.indexOffset,
                    bonesPerVertex, chunkData.boneindex, chunkData.indices, 1, 0, bonesPerVertex);

                // Distribute weights to chunks
                chunkData.boneweight = new Float32Array(chunk.vertexCount * bonesPerVertex);
                Utils.reIndex(skinWeights, chunkSrcIndices.indices, chunkSrcIndices.indexStride, chunkSrcIndices.indexOffset,
                    bonesPerVertex, chunkData.boneweight, chunkData.indices, 1, 0, bonesPerVertex);
            }

            // Copy bind shape matrices
            for (var i = 0; i < geometry.chunks.length; ++i) {
                var chunk: GeometryChunk = geometry.chunks[i];
                chunk.bindShapeMatrix = new BABYLON.Matrix();
                chunk.bindShapeMatrix.copyFrom(bindShapeMatrix);
            }

            // Apply bind shape matrices
            if (context.options.applyBindShape.value === true) {
                Geometry.applyBindShapeMatrices(geometry, context);
            }

            // Sort bones if necessary
            if (context.options.sortBones.value) {
                skeleton = Skeleton.sortBones(skeleton, context);
            }
            Geometry.setSkeleton(geometry, skeleton, context);
            return geometry;
        }

        static compactSkinningData(skin: Skin, weightsData: Float32Array, bonesPerVertex: number,
            context: ConverterContext): { weights: Float32Array; indices:Uint8Array} {
            var weightsIndices: Int32Array | undefined = skin.vertexWeights?.v;
            var weightsCounts: Int32Array | undefined = skin.vertexWeights?.vcount;
            var skinVertexCount: number = weightsCounts?.length || 0;
            var skinWeights: Float32Array = new Float32Array(skinVertexCount * bonesPerVertex);
            var skinIndices: Uint8Array = new Uint8Array(skinVertexCount * bonesPerVertex);

            if (!weightsCounts || !weightsIndices) {
                return  { weights: skinWeights, indices: skinIndices };
            }

            var vindex: number = 0;
            var verticesWithTooManyInfluences: number = 0;
            var verticesWithInvalidTotalWeight: number = 0;
            var weightCounts: Float32Array = new Float32Array(32);
            for (var i = 0; i < skinVertexCount; ++i) {

                // Number of bone references for the current vertex
                var weightCount: number = weightsCounts[i];
                if (weightCount > bonesPerVertex) {
                    verticesWithTooManyInfluences++;
                }
                weightCounts[Math.min(weightCount, weightCounts.length - 1)]++;

                // Insert all bone references
                for (var w: number = 0; w < weightCount; ++w) {
                    var boneIndex: number = weightsIndices[vindex];
                    var boneWeightIndex: number = weightsIndices[vindex + 1];
                    vindex += 2;
                    var boneWeight: number = weightsData[boneWeightIndex];

                    var offsetBegin: number = i * bonesPerVertex;
                    var offsetEnd: number = i * bonesPerVertex + bonesPerVertex - 1;
                    Utils.insertBone(skinIndices, skinWeights, boneIndex, boneWeight, offsetBegin, offsetEnd);
                }

                // Total weight
                var totalWeight: number = 0;
                for (var w: number = 0; w < bonesPerVertex; ++w) {
                    totalWeight += skinWeights[i * bonesPerVertex + w];
                }

                // Normalize weights (COLLADA weights should be already normalized)
                if (totalWeight < 1e-6 || totalWeight > 1e6) {
                    verticesWithInvalidTotalWeight++;
                } else {
                    for (var w: number = 0; w < weightCount; ++w) {
                        skinWeights[i * bonesPerVertex + w] /= totalWeight;
                    }
                }
            }

            if (verticesWithTooManyInfluences > 0) {
                context.log.write("" + verticesWithTooManyInfluences + " vertices are influenced by too many bones, some influences were ignored. Only " + bonesPerVertex + " bones per vertex are supported.", LogLevel.Warning);
            }
            if (verticesWithInvalidTotalWeight > 0) {
                context.log.write("" + verticesWithInvalidTotalWeight + " vertices have zero or infinite total weight, skin will be broken.", LogLevel.Warning);
            }
            return { weights: skinWeights, indices: skinIndices };
        }

        static getSkeletonRootNodes(skeletonLinks: Link[], context: ConverterContext): VisualSceneNode[] {
            var skeletonRootNodes: VisualSceneNode[] = [];
            for (var i: number = 0; i < skeletonLinks.length; i++) {
                var skeletonLink: Link = skeletonLinks[i];
                var skeletonRootNode: VisualSceneNode | undefined = VisualSceneNode.fromLink(skeletonLink, context);
                if (!skeletonRootNode) {
                    context.log.write("Skeleton root node " + skeletonLink.getUrl() + " not found, skeleton root ignored", LogLevel.Warning);
                    continue;
                }
                skeletonRootNodes.push(skeletonRootNode);
            }
            if (skeletonRootNodes.length === 0) {
                context.log.write("Controller has no skeleton, using the whole scene as the skeleton root", LogLevel.Warning);
                skeletonRootNodes = context.nodes.collada.filter((node: VisualSceneNode) => (context.isInstanceOf(node.parent, "VisualScene")));
            }
            return skeletonRootNodes;
        }

        static createMorph(instanceController: InstanceController, controller: Controller, context: ConverterContext): Geometry | undefined{
            context.log.write("Morph animated meshes not supported, mesh ignored", LogLevel.Warning);
            return undefined;
        }

        static createGeometry(geometry: LoaderGeometry.Geometry, instanceMaterials: InstanceMaterial[], context: ConverterContext): Geometry {
            var materialMap: MaterialMap = Material.getMaterialMap(instanceMaterials, context);

            var result: Geometry = new Geometry();
            result.name = geometry.name || geometry.id || geometry.sid || "geometry";

            // Loop over all <triangle> elements
            var trianglesList: Triangles[] = geometry.triangles;
            for (var i: number = 0; i < trianglesList.length; i++) {
                var triangles = trianglesList[i];

                // Find the used material
                var material: Material;
                if (triangles.material !== null) {
                    material = materialMap.symbols[triangles.material];
                    if (!material) {
                        context.log.write("Material symbol " + triangles.material + " has no bound material instance, using default material", LogLevel.Warning);
                        material = Material.createDefaultMaterial(context);
                    }
                } else {
                    context.log.write("Missing material index, using default material", LogLevel.Warning);
                    material = Material.createDefaultMaterial(context);
                }

                // Create a geometry chunk
                var chunk = GeometryChunk.createChunk(geometry, triangles, context);
                if (chunk) {
                    chunk.name = result.name;
                    if (trianglesList.length > 1) {
                        chunk.name += (" #" + i)
                    }
                    chunk.material = material;
                    result.chunks.push(chunk);
                }
            }

            return result;
        }

        /**
        * Transforms the given geometry (position and normals) by the given matrix
        */
        static transformGeometry(geometry: Geometry, transformMatrix: BABYLON.Matrix, context: ConverterContext) {
            // Create the normal transformation matrix
            var normalMatrix: BABYLON.Matrix = new BABYLON.Matrix;
            transformMatrix.toNormalMatrix(normalMatrix);

            // Transform normals and positions of all chunks
            for (var i = 0; i < geometry.chunks.length; ++i) {
                var chunk: GeometryChunk = geometry.chunks[i];

                GeometryChunk.transformChunk(chunk, transformMatrix, normalMatrix, context);
            }
        }

        /**
        * Adapts inverse bind matrices to account for any additional transformations due to the world transform
        */
        static setupWorldTransform(geometry: Geometry, context: ConverterContext) {
            if (!geometry.skeleton) return;

            // Skinning equation:                [worldMatrix]     * [invBindMatrix]        * [pos]
            // Same with transformation A added: [worldMatrix]     * [invBindMatrix * A^-1] * [A * pos]
            // Same with transformation B added: [worldMatrix * B] * [B^-1 * invBindMatrix] * [pos]
            geometry.skeleton?.bones.forEach((bone) => {
                
                // Transformation A (the world scale)
                if (context.options.worldTransformBake) {
                    bone.invBindMatrix = bone.invBindMatrix.multiply(Utils.getWorldInvTransform(context));
                }

                // Transformation B (the post-transformation of the corresponding node)
                if (context.options.worldTransformUnitScale) {
                    var mat = BABYLON.Matrix.Invert(bone.node.transformation_post);
                    bone.invBindMatrix = mat.multiply(bone.invBindMatrix);
                }
            });
        }

        /**
        * Scales the given geometry
        */
        static scaleGeometry(geometry: Geometry, scale: number, context: ConverterContext) {
            for (var i = 0; i < geometry.chunks.length; ++i) {
                var chunk: GeometryChunk = geometry.chunks[i];
                GeometryChunk.scaleChunk(chunk, scale, context);
            }

            if (geometry.skeleton && geometry.skeleton.bones) {
                geometry.skeleton.bones.forEach((bone) => {
                    bone.invBindMatrix[12] *= scale;
                    bone.invBindMatrix[13] *= scale;
                    bone.invBindMatrix[14] *= scale;
                });
            }
        }

        /**
        * Applies the bind shape matrix to the given geometry.
        *
        * This transforms the geometry by the bind shape matrix, and resets the bind shape matrix to identity.
        */
        static applyBindShapeMatrices(geometry: Geometry, context: ConverterContext) {

            // Transform normals and positions of all chunks by the corresponding bind shape matrix
            for (var i = 0; i < geometry.chunks.length; ++i) {
                var chunk: GeometryChunk = geometry.chunks[i];

                var bindShapeMatrix: BABYLON.Matrix = chunk.bindShapeMatrix;
                if (bindShapeMatrix) {
                    var normalMatrix: BABYLON.Matrix = new BABYLON.Matrix();
                    bindShapeMatrix.toNormalMatrix(normalMatrix);

                    // Pre-multiply geometry data by the bind shape matrix
                    GeometryChunk.transformChunk(chunk, bindShapeMatrix, normalMatrix, context);

                    // Reset the bind shape matrix
                    chunk.bindShapeMatrix = BABYLON.Matrix.Identity();
                }
            }
        }

        /**
        * Computes the bounding box of the static (unskinned) geometry
        */
        static computeBoundingBox(geometry: Geometry, context: ConverterContext) {
            geometry.boundingBox.reset();

            for (var i: number = 0; i < geometry.chunks.length; ++i) {
                var chunk: GeometryChunk = geometry.chunks[i];
                GeometryChunk.computeBoundingBox(chunk, context);
                geometry.boundingBox.extendBox(chunk.boundingBox);
            }
        }

        static addSkeleton(geometry: Geometry, node: Node, context: ConverterContext) {
            // Create a skeleton from a single node
            var skeleton = Skeleton.createFromNode(node, context);
            Geometry.setSkeleton(geometry, skeleton, context);

            // Attach all geometry to the bone representing the given node
            for (var i = 0; i < geometry.chunks.length; ++i) {
                var chunk: GeometryChunk = geometry.chunks[i];
                var chunkData: GeometryData = chunk.data;

                chunkData.boneindex = new Uint8Array(chunk.vertexCount * 4);
                chunkData.boneweight = new Float32Array(chunk.vertexCount * 4);
                for (var v = 0; v < chunk.vertexCount; ++v) {
                    chunkData.boneindex[4 * v + 0] = 0;
                    chunkData.boneindex[4 * v + 1] = 0;
                    chunkData.boneindex[4 * v + 2] = 0;
                    chunkData.boneindex[4 * v + 3] = 0;

                    chunkData.boneweight[4 * v + 0] = 1;
                    chunkData.boneweight[4 * v + 1] = 0;
                    chunkData.boneweight[4 * v + 2] = 0;
                    chunkData.boneweight[4 * v + 3] = 0;
                }
            }

            // Sort bones if necessary
            if (context.options.sortBones.value) {
                skeleton = Skeleton.sortBones(skeleton, context);
            }
            Geometry.setSkeleton(geometry, skeleton, context);
        }

        /**
        * Moves all data from given geometries into one merged geometry.
        * The original geometries will be empty after this operation (lazy design to avoid data duplication).
        */
        static mergeGeometries(geometries: Geometry[], context: ConverterContext): Geometry | undefined {
            if (geometries.length === 0) {
                context.log.write("No geometries to merge", LogLevel.Warning);
                return undefined;
            } else if (geometries.length === 1) {
                return geometries[0];
            }

            var result: Geometry = new Geometry();
            result.name = "merged_geometry";

            // Merge skeleton bones
            var skeleton = new Skeleton([]);
            geometries.forEach((g) => {
                if (g.skeleton !== null) {
                    skeleton = Skeleton.mergeSkeletons(skeleton, g.skeleton, context);
                }
            });

            // Sort bones if necessary
            if (context.options.sortBones.value) {
                skeleton = Skeleton.sortBones(skeleton, context);
            }
            Geometry.setSkeleton(result, skeleton, context);

            // Recode bone indices
            geometries.forEach((geometry) => {
                Geometry.setSkeleton(geometry, skeleton, context);
            });

            // Merge geometry chunks
            geometries.forEach((geometry) => {
                result.chunks = result.chunks.concat(geometry.chunks);
            });

            // We modified the original data, unlink it from the original geometries
            geometries.forEach((geometry) => {
                geometry.chunks = [];
            });

            return result;
        }

        /**
        * Set the new skeleton for the given geometry.
        * Changes all vertex bone indices so that they point to the given skeleton bones, instead of the current geometry.skeleton bones
        */
        static setSkeleton(geometry: Geometry, skeleton: Skeleton, context: ConverterContext) {

            // Adapt bone indices
            if (geometry.skeleton) {
                // Compute the index map
                var index_map: Uint32Array = Skeleton.getBoneIndexMap(geometry.skeleton, skeleton);

                // Recode indices
                for (var i = 0; i < geometry.chunks.length; ++i) {
                    var chunk: GeometryChunk = geometry.chunks[i];
                    var boneindex = chunk.data.boneindex;

                    if (boneindex) {
                        for (var j = 0; j < boneindex.length; ++j) {
                            boneindex[j] = index_map[boneindex[j]];
                        }
                    }
                }
            }

            geometry.skeleton = skeleton;
        }

    }
