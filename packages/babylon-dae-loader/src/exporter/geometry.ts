import * as COLLADAContext from "../context"
import {Log, LogLevel} from "../log"

import * as Utils from "./utils"
import {BoundingBoxJSON, GeometryJSON} from "./format"
import { GeometryChunk } from "../converter/geometry_chunk";
import { ExporterContext } from "./context";
import { DataChunk } from "./data_chunk";
import * as ConverterBoundingBox from "../converter/bounding_box";

    export class BoundingBox {

        static toJSON(box: ConverterBoundingBox.BoundingBox): BoundingBoxJSON {
            if (!box) {
                return {
                    min: [0, 0, 0],
                    max: [0, 0, 0]
                };
                }

            return {
                min: [box.min[0], box.min[1], box.min[2]],
                max: [box.max[0], box.max[1], box.max[2]]
            };
        }
    }

    export class Geometry {

        static toJSON(chunk: GeometryChunk, material_index: number, context: ExporterContext): GeometryJSON {

            var indices: DataChunk = DataChunk.create(chunk.data.indices, 3, context);
            var position: DataChunk = DataChunk.create(chunk.data.position, 3, context);
            var normal: DataChunk = DataChunk.create(chunk.data.normal, 3, context);
            var texcoord: DataChunk = DataChunk.create(chunk.data.texcoord, 2, context);
            var boneweight: DataChunk = DataChunk.create(chunk.data.boneweight, 4, context);
            var boneindex: DataChunk = DataChunk.create(chunk.data.boneindex, 4, context);

            return {
                name: chunk.name,
                material: material_index,
                vertex_count: chunk.vertexCount,
                triangle_count: chunk.triangleCount,
                indices: DataChunk.toJSON(indices),
                position: DataChunk.toJSON(position),
                normal: DataChunk.toJSON(normal),
                texcoord: DataChunk.toJSON(texcoord),
                boneweight: DataChunk.toJSON(boneweight),
                boneindex: DataChunk.toJSON(boneindex),
                bounding_box: BoundingBox.toJSON(chunk.boundingBox)
            }
        }
    }
