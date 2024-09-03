import { promises as fs } from 'fs';
import * as BABYLON from "babylonjs";
import {RMXModelLoader} from "../model-loader"
import {RMXModel} from "../model"
import * as Utils from "./utils"
import {Log, LogLevel, LogConsole, LogCallback, LogFilter} from "../log"
import { GeometryChunk } from '../converter/geometry_chunk';
import { ExporterContext } from './context';
import { MaterialJSON, GeometryJSON, InfoJSON, BoneJSON, AnimationJSON } from './format';
import * as ConverterDocument from '../converter/file';
import * as ExporterDocument from '../exporter/document';
import { Geometry } from '../converter/geometry';
import { Material } from './material';
import { BoundingBox } from './geometry';
import { Skeleton } from './skeleton';
import { Animation } from './animation';
import * as ExporterGeometry from "../exporter/geometry"
import { Document } from './document';

    export class ColladaExporter {
        log: Log;

        constructor() {
            this.log = new LogConsole();
        }

        export(doc: ConverterDocument.Document): ExporterDocument.Document {
            var context: ExporterContext = new ExporterContext(this.log);

            if (!doc) {
                context.log.write("No document to convert", LogLevel.Warning);
                return null;
            }

            if (doc.geometries.length === 0) {
                context.log.write("Document contains no geometry, nothing exported", LogLevel.Warning);
                return null;
            } else if (doc.geometries.length > 1) {
                context.log.write("Document contains multiple geometries, only the first geometry is exported", LogLevel.Warning);
            }

            // Geometry and materials
            var converter_materials: Material[] = [];
            var materials: MaterialJSON[] = [];
            var converter_geometry: Geometry = doc.geometries[0];
            var chunks: GeometryJSON[] = [];

            for (var c: number = 0; c < converter_geometry.chunks.length; ++c) {
                var chunk: GeometryChunk = converter_geometry.chunks[c];

                // Create the material, if it does not exist yet
                var material_index: number = converter_materials.indexOf(chunk.material);
                if (material_index === -1) {
                    var material: MaterialJSON = Material.toJSON(chunk.material, context);
                    material_index = materials.length;

                    converter_materials.push(chunk.material);
                    materials.push(material);
                }

                // Create the geometry
                chunks.push(ExporterGeometry.Geometry.toJSON(chunk, material_index, context));
            }

            // Result
            var result: Document = new Document();

            var info: InfoJSON = {
                bounding_box: BoundingBox.toJSON(converter_geometry.boundingBox)
            };
            var bones: BoneJSON[] = Skeleton.toJSON(converter_geometry.getSkeleton(), context);
            var animations: AnimationJSON[] = doc.resampled_animations.map((e) => Animation.toJSON(e, context));

            // Assemble result: JSON part
            result.json = {
                info: info,
                materials: materials,
                chunks: chunks,
                bones: bones,
                animations: animations
            };

            // Assemble result: Binary data part
            result.data = context.assembleData();
            //result.json.data = Utils.bufferToString(result.data);

            return result;
        }
    }
