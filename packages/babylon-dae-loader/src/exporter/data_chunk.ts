import {Log, LogLevel} from "../log"
import { ExporterContext } from "./context";
import { DataChunkJSON } from "./format";



    export class DataChunk {
        data: any;
        type: string | undefined;
        byte_offset: number = 0;
        stride: number = 0;
        count: number = 0;
        bytes_per_element: number = 0;

        constructor() {
            this.data = null;

        }

        getDataView(): Uint8Array {
            return new Uint8Array(this.data.buffer, 0, this.stride * this.count * this.bytes_per_element);
        }

        getBytesCount(): number {
            return this.data.length * this.bytes_per_element;
        }

        static toJSON(chunk: DataChunk): DataChunkJSON {
            if (!chunk || !chunk.type) {
                chunk.type = "";
            }

            var result: DataChunkJSON = {
                type: chunk.type,
                byte_offset: chunk.byte_offset,
                stride: chunk.stride,
                count: chunk.count
            }

            return result;
        }

        static create(data: any, stride: number, context: ExporterContext): DataChunk{
            var result: DataChunk = new DataChunk();
            if (!data) {
                return result;
            }

            result.data = data;
            result.stride = stride;
            result.count = data.length / stride;

            if (data instanceof Float32Array) {
                result.type = "float";
                result.bytes_per_element = 4;
            } else if (data instanceof Float64Array) {
                result.type = "double";
                result.bytes_per_element = 8;
            } else if (data instanceof Uint8Array) {
                result.type = "uint8";
                result.bytes_per_element = 1;
            } else if (data instanceof Uint16Array) {
                result.type = "uint16";
                result.bytes_per_element = 2;
            } else if (data instanceof Uint32Array) {
                result.type = "uint32";
                result.bytes_per_element = 4;
            } else if (data instanceof Int8Array) {
                result.type = "int8";
                result.bytes_per_element = 1;
            } else if (data instanceof Int16Array) {
                result.type = "int16";
                result.bytes_per_element = 2;
            } else if (data instanceof Int32Array) {
                result.type = "int32";
                result.bytes_per_element = 4;
            } else {
                context.log.write("Unknown data type, data chunk ignored", LogLevel.Warning);
                return result;
            }

            context.registerChunk(result);
            return result;
        }
    };
