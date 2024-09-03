import {Log, LogLevel} from "../log"

import * as SourceLoader from "../loader/source"

import * as Utils from "./utils"
import * as MathUtils from "../math"
import {Material} from "./material"
import {Texture} from "./texture"
import {AnimationTarget} from "./animation"
import * as COLLADAContext from "../context"
import {Options} from "./options"
import {BoundingBox} from "./bounding_box"
import * as BABYLON from 'babylonjs';
import { Input } from "../loader/input"
import { Triangles } from "../loader/triangles"
import { Vertices } from "../loader/vertices"
import * as LoaderGeometry from "../loader/geometry"
import { ConverterContext } from "./context"

    export class GeometryData {
        indices: Uint32Array = new Uint32Array();
        position: Float32Array = new Float32Array();
        normal: Float32Array = new Float32Array();
        texcoord: Float32Array = new Float32Array();
        boneweight: Float32Array = new Float32Array();
        boneindex: Uint8Array = new Uint8Array();
    }

    export class GeometryChunkSourceIndices {
        /** Original indices, contained in <triangles>/<p> */
        indices: Uint32Array = new Uint32Array();
        /** The stride of the original indices (number of independent indices per vertex) */
        indexStride: number = 0;
        /** The offset of the main (position) index in the original vertices */
        indexOffset: number = 0;
    }

    export class GeometryChunk {
        public name: string = "";
        /** Number of elements in the vertex buffer (i.e., number of unique vertices) */
        public vertexCount: number = 0;
        /** Number of triangles */
        public triangleCount: number = 0;
        /** Vertices for this chunk start at data.vertices[vertexBufferOffset] */
        public vertexBufferOffset: number = 0;
        /** Indices for this chunk start at data.indices[indexBufferOffset] */
        public indexBufferOffset: number = 0;
        /** Geometry data buffer */
        public data: GeometryData = new GeometryData();
        public material: Material = new Material();
        public boundingBox: BoundingBox= new BoundingBox();;
        /** Bind shape matrix (skinned geometry only) */
        public bindShapeMatrix: BABYLON.Matrix = new BABYLON.Matrix();
        /** Backup of the original COLLADA indices, for internal use only */
        public _colladaIndices: GeometryChunkSourceIndices = new GeometryChunkSourceIndices();

        /**
        * Creates a geometry chunk with its own geometry data buffers.
        *
        * This de-indexes the COLLADA data, so that it is usable by GPUs.
        */
        static createChunk(geometry: LoaderGeometry.Geometry, triangles: Triangles, context: ConverterContext): GeometryChunk | undefined{
            if (!triangles?.inputs) {
                return undefined;
            }

            // Per-triangle data input
            var inputTriVertices: Input | undefined;
            var inputTriNormal: Input | undefined;
            var inputTriColor: Input | undefined;
            var inputTriTexcoord: Input[] = [];
            for (var i: number = 0; i < triangles.inputs.length; i++) {
                var input: Input = triangles.inputs[i];
                switch (input.semantic) {
                    case "VERTEX":
                        inputTriVertices = input;
                        break;
                    case "NORMAL":
                        inputTriNormal = input;
                        break;
                    case "COLOR":
                        inputTriColor = input;
                        break;
                    case "TEXCOORD":
                        inputTriTexcoord.push(input);
                        break;
                    default:
                        context.log.write("Unknown triangles input semantic " + input.semantic + " ignored", LogLevel.Warning);
                }
            }

            if (!inputTriVertices || !inputTriVertices.source) {
                return undefined;
            }

            // Per-triangle data source
            var srcTriVertices = Vertices.fromLink(inputTriVertices.source, context);
            if (!srcTriVertices) {
                context.log.write("Geometry " + geometry.id + " has no vertices, geometry ignored", LogLevel.Warning);
                return undefined;
            }
            var srcTriNormal = SourceLoader.Source.fromLink(inputTriNormal != null ? inputTriNormal.source : undefined, context);
            var srcTriColor = SourceLoader.Source.fromLink(inputTriColor != null ? inputTriColor.source : undefined, context);
            var srcTriTexcoord = inputTriTexcoord.map((x: Input) => SourceLoader.Source.fromLink(x != null ? x.source : undefined, context));

            // Per-vertex data input
            var inputVertPos = null;
            var inputVertNormal = null;
            var inputVertColor = null;
            var inputVertTexcoord: Input[] = [];
            for (var i: number = 0; i < srcTriVertices.inputs.length; i++) {
                var input: Input = srcTriVertices.inputs[i];
                switch (input.semantic) {
                    case "POSITION":
                        inputVertPos = input;
                        break;
                    case "NORMAL":
                        inputVertNormal = input;
                        break;
                    case "COLOR":
                        inputVertColor = input;
                        break;
                    case "TEXCOORD":
                        inputVertTexcoord.push(input);
                        break;
                    default:
                        context.log.write("Unknown vertices input semantic " + input.semantic + " ignored", LogLevel.Warning);
                }
            }

            if (!inputVertPos || !inputVertPos.source) {
                return undefined;
            }

            // Per-vertex data source
            var srcVertPos = SourceLoader.Source.fromLink(inputVertPos.source, context);
            if (!srcVertPos) {
                context.log.write("Geometry " + geometry.id + " has no vertex positions, geometry ignored", LogLevel.Warning);
                return undefined;
            }
            var srcVertNormal = SourceLoader.Source.fromLink(inputVertNormal != null ? inputVertNormal.source : undefined, context);
            var srcVertColor = SourceLoader.Source.fromLink(inputVertColor != null ? inputVertColor.source : undefined, context);
            var srcVertTexcoord = inputVertTexcoord.map((x: Input) => SourceLoader.Source.fromLink(x != null ? x.source : undefined, context));

            // Raw data
            var dataVertPos: Float32Array = Utils.createFloatArray(srcVertPos, "vertex position", 3, context);
            var dataVertNormal: Float32Array = Utils.createFloatArray(srcVertNormal, "vertex normal", 3, context);
            var dataTriNormal: Float32Array = Utils.createFloatArray(srcTriNormal, "vertex normal (indexed)", 3, context);
            var dataVertColor: Float32Array = Utils.createFloatArray(srcVertColor, "vertex color", 4, context);
            var dataTriColor: Float32Array = Utils.createFloatArray(srcTriColor, "vertex color (indexed)", 4, context);
            var dataVertTexcoord: Float32Array[] = srcVertTexcoord.map((x) => Utils.createFloatArray(x, "texture coordinate", 2, context));
            var dataTriTexcoord: Float32Array[] = srcTriTexcoord.map((x) => Utils.createFloatArray(x, "texture coordinate (indexed)", 2, context));

            // Make sure the geometry only contains triangles
            if (triangles.type !== "triangles") {
                var vcount = triangles.vcount;
                if (vcount) {
                    for (var i: number = 0; i < vcount.length; i++) {
                        var c: number = vcount[i];
                        if (c !== 3) {
                            context.log.write("Geometry " + geometry.id + " has non-triangle polygons, geometry ignored.", LogLevel.Warning);
                            return undefined;
                        }
                    }
                } else {
                    context.log.write("Geometry " + geometry.id + " has polygons with an unknown number of vertices per polygon. Assuming all triangles.", LogLevel.Warning);
                }
            }

            // Security checks
            if (srcVertPos.stride !== 3) {
                context.log.write("Geometry " + geometry.id + " vertex positions are not 3D vectors, geometry ignored", LogLevel.Warning);
                return undefined;
            }

            // Extract indices used by this chunk
            var colladaIndices = triangles.indices;
            var trianglesCount = triangles.count;
            var triangleStride = colladaIndices.length / triangles.count;
            var triangleVertexStride = triangleStride / 3;
            var indices = Utils.compactIndices(colladaIndices, triangleVertexStride, inputTriVertices.offset);

            if ((!indices) || (indices.length === 0)) {
                context.log.write("Geometry " + geometry.id + " does not contain any indices, geometry ignored", LogLevel.Error);
                return undefined;
            }

            // The vertex count (size of the vertex buffer) is the number of unique indices in the index buffer
            var vertexCount: number = Utils.maxIndex(indices) + 1;
            var triangleCount: number = indices.length / 3;

            if (triangleCount !== trianglesCount) {
                context.log.write("Geometry " + geometry.id + " has an inconsistent number of indices, geometry ignored", LogLevel.Error);
                return undefined;
            }

            // Position buffer
            var position = new Float32Array(vertexCount * 3);
            var indexOffsetPosition: number = inputTriVertices.offset;
            Utils.reIndex(dataVertPos, colladaIndices, triangleVertexStride, indexOffsetPosition, 3, position, indices, 1, 0, 3);

            // Normal buffer
            var normal = new Float32Array(vertexCount * 3);
            var indexOffsetNormal = inputTriNormal !== null ? inputTriNormal?.offset : null;
            if (dataVertNormal !== null) {
                Utils.reIndex(dataVertNormal, colladaIndices, triangleVertexStride, indexOffsetPosition, 3, normal, indices, 1, 0, 3);
            } else if (dataTriNormal !== null) {
                Utils.reIndex(dataTriNormal, colladaIndices, triangleVertexStride, indexOffsetNormal, 3, normal, indices, 1, 0, 3);
            } else {
                context.log.write("Geometry " + geometry.id + " has no normal data, using zero vectors", LogLevel.Warning);
            }

            // Texture coordinate buffer
            var texcoord = new Float32Array(vertexCount * 2);
            var indexOffsetTexcoord = inputTriTexcoord.length > 0 ? inputTriTexcoord[0].offset : null;
            if (dataVertTexcoord.length > 0) {
                Utils.reIndex(dataVertTexcoord[0], colladaIndices, triangleVertexStride, indexOffsetPosition, 2, texcoord, indices, 1, 0, 2);
            } else if (dataTriTexcoord.length > 0) {
                Utils.reIndex(dataTriTexcoord[0], colladaIndices, triangleVertexStride, indexOffsetTexcoord, 2, texcoord, indices, 1, 0, 2);
            } else {
                context.log.write("Geometry " + geometry.id + " has no texture coordinate data, using zero vectors", LogLevel.Warning);
            }

            // Geometry data buffers
            var geometryData: GeometryData = new GeometryData();
            geometryData.indices = indices;
            geometryData.position = position;
            geometryData.normal = normal;
            geometryData.texcoord = texcoord;

            // Backup of the original COLLADA indices
            var sourceIndices: GeometryChunkSourceIndices = new GeometryChunkSourceIndices();
            sourceIndices.indices = colladaIndices;
            sourceIndices.indexStride = triangleVertexStride;
            sourceIndices.indexOffset = indexOffsetPosition;

            // Geometry chunk
            var result: GeometryChunk = new GeometryChunk();
            result.vertexCount = vertexCount;
            result.vertexBufferOffset = 0;
            result.triangleCount = triangleCount;
            result.indexBufferOffset = 0;
            result.data = geometryData;
            result._colladaIndices = sourceIndices; 

            return result;
        }

        /**
        * Computes the bounding box of the static (unskinned) geometry
        */
        static computeBoundingBox(chunk: GeometryChunk, context: ConverterContext) {
            chunk.boundingBox.fromPositions(chunk.data.position, chunk.vertexBufferOffset, chunk.vertexCount);
        }


        static transformEachVector(position: Float32Array, transform: BABYLON.Matrix) {
            let vec = new BABYLON.Vector3();
            for (let i = 0; i < position.length; i += 3) {
                vec.set(position[i], position[i + 1], position[i + 2]);

                BABYLON.Vector3.TransformCoordinates(vec, transform);

                position[i] = vec.x;
                position[i + 1] = vec.y;
                position[i + 2] = vec.z;
            }
        }

        /**
        * Transforms the positions and normals of the given Chunk by the given matrices
        */
        static transformChunk(chunk: GeometryChunk, positionMatrix: BABYLON.Matrix, normalMatrix: BABYLON.Matrix, context: ConverterContext) {
            var position: Float32Array = chunk.data.position;
            if (position !== null) {
                GeometryChunk.transformEachVector(position, positionMatrix);
            }

            var normal: Float32Array = chunk.data.normal;
            if (normal !== null) {
                GeometryChunk.transformEachVector(normal, normalMatrix);
            }
        }

        /**
        * Scales the positions of the given Chunk
        */
        static scaleChunk(chunk: GeometryChunk, scale: number, context: ConverterContext) {
            var position: Float32Array = chunk.data.position;
            if (position !== null) {
                for (var i = 0; i < position.length; ++i) {
                    position[i] = position[i] * scale;
                }
            }
        }


        /**
        * Merges the geometric data from all the chunks into a single set of buffers.
        * The old buffers of the chunks are discarded and replaced by the new (bigger) buffers.
        * Each chunk then uses the same buffers, but uses a different portion of the buffers, according to the triangleCount and triangleOffset.
        * A single new chunk containing all the geometry is returned.
        */
        static mergeChunkData(chunks: GeometryChunk[], context: ConverterContext) {

            if (chunks.length < 2) {
                return;
            }

            // Count number of data elements
            var vertexCount = 0;
            var triangleCount = 0;

            var has_position: boolean = (chunks.length > 0);
            var has_normal: boolean = (chunks.length > 0);
            var has_texcoord: boolean = (chunks.length > 0);
            var has_boneweight: boolean = (chunks.length > 0);
            var has_boneindex: boolean = (chunks.length > 0);
            for (var i: number = 0; i < chunks.length; ++i) {
                var chunk: GeometryChunk = chunks[i];
                var chunkData: GeometryData = chunk.data;

                vertexCount += chunk.vertexCount;
                triangleCount += chunk.triangleCount;

                has_position = has_position && (chunkData.position !== null);
                has_normal = has_normal && (chunkData.normal !== null);
                has_texcoord = has_texcoord && (chunkData.texcoord !== null);
                has_boneweight = has_boneweight && (chunkData.boneweight !== null);
                has_boneindex = has_boneindex && (chunkData.boneindex !== null);
            }

            // Create data buffers
            var resultData = new GeometryData();
            resultData.indices = new Uint32Array(triangleCount * 3);
            if (has_position) {
                resultData.position = new Float32Array(vertexCount * 3);
            }
            if (has_normal) {
                resultData.normal = new Float32Array(vertexCount * 3);
            }
            if (has_texcoord) {
                resultData.texcoord = new Float32Array(vertexCount * 2);
            }
            if (has_boneindex) {
                resultData.boneindex = new Uint8Array(vertexCount * 4);
            }
            if (has_boneweight) {
                resultData.boneweight = new Float32Array(vertexCount * 4);
            }

            // Copy data
            var indexBufferOffset: number = 0;
            var vertexBufferOffset: number = 0;
            for (var i: number = 0; i < chunks.length; ++i) {
                var chunk: GeometryChunk = chunks[i];
                var chunkData: GeometryData = chunk.data;

                // Copy index data
                for (var j: number = 0; j < chunk.triangleCount * 3; ++j) {
                    resultData.indices[indexBufferOffset + j] = chunkData.indices[j + chunk.indexBufferOffset] + vertexBufferOffset;
                }

                // Copy vertex data
                if (has_position) {
                    MathUtils.copyNumberArrayOffset(chunkData.position, chunk.vertexBufferOffset * 3, resultData.position, vertexBufferOffset * 3,
                        chunk.vertexCount * 3);
                }
                if (has_normal) {
                    MathUtils.copyNumberArrayOffset(chunkData.normal, chunk.vertexBufferOffset * 3, resultData.normal, vertexBufferOffset * 3,
                        chunk.vertexCount * 3);
                }
                if (has_texcoord) {
                    MathUtils.copyNumberArrayOffset(chunkData.texcoord, chunk.vertexBufferOffset * 2, resultData.texcoord, vertexBufferOffset * 2,
                        chunk.vertexCount * 2);
                }
                if (has_boneweight) {
                    MathUtils.copyNumberArrayOffset(chunkData.boneweight, chunk.vertexBufferOffset * 4, resultData.boneweight, vertexBufferOffset * 4,
                        chunk.vertexCount * 4);
                }
                if (has_boneindex) {
                    MathUtils.copyNumberArrayOffset(chunkData.boneindex, chunk.vertexBufferOffset * 4, resultData.boneindex, vertexBufferOffset * 4,
                        chunk.vertexCount * 4);
                }

                // Discard the original chunk data
                chunk.data = resultData;
                chunk.vertexBufferOffset = vertexBufferOffset;
                chunk.indexBufferOffset = indexBufferOffset;

                // Update offset
                vertexBufferOffset += chunk.vertexCount;
                indexBufferOffset += chunk.triangleCount * 3;
            }

        }

    }

