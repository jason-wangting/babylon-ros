import * as COLLADAContext from "../context"
import {Log, LogLevel} from "../log"

import * as Utils from "./utils"
import * as MathUtils from "../math"
import {AnimationTrack} from "./animation_track"
import { DataChunk } from "./data_chunk"


    export class ExporterContext extends COLLADAContext.Context {
        log: Log;
        chunks: DataChunk[];
        chunk_data: Uint8Array[];
        bytes_written: number;

        constructor(log: Log) {
            super(log);
            this.log = log;
            this.chunks = [];
            this.chunk_data = [];
            this.bytes_written = 0;
        }

        registerChunk(chunk: DataChunk) {
            this.chunks.push(chunk);
            chunk.byte_offset = this.bytes_written;
            this.bytes_written += chunk.getBytesCount();
        }

        assembleData(): Uint8Array {
            // Allocate result
            var buffer: ArrayBuffer = new ArrayBuffer(this.bytes_written);
            var result: Uint8Array = new Uint8Array(buffer);

            // Copy data from all chunks
            for (var i: number = 0; i < this.chunks.length; ++i) {
                var chunk: DataChunk = this.chunks[i];
                var chunk_data: Uint8Array = chunk.getDataView();
                var chunk_data_length: number = chunk_data.length;
                var chunk_data_offet: number = chunk.byte_offset;

                for (var j: number = 0; j < chunk_data_length; ++j) {
                    result[j + chunk_data_offet] = chunk_data[j];
                }
            }

            return result;
        }
    }
