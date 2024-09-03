import {Context} from "../context"
import {LogLevel} from "../log"
import * as Utils from "./utils"
import * as MathUtils from "../math"
import { AnimationDataTrack } from "../converter/animation_data";
import { ExporterContext } from "./context";
import { DataChunk } from "./data_chunk";
import { AnimationTrackJSON } from "./format";

    export class AnimationTrack {

        static toJSON(track: AnimationDataTrack, index: number, context: ExporterContext): AnimationTrackJSON {
            if (!track) {
                return null;
            }

            var pos = DataChunk.create(track.pos, 3, context);
            var rot = DataChunk.create(track.rot, 4, context);
            var scl = DataChunk.create(track.scl, 3, context);

            return {
                bone: index,
                pos: DataChunk.toJSON(pos),
                rot: DataChunk.toJSON(rot),
                scl: DataChunk.toJSON(scl)
            };
        }
    }
