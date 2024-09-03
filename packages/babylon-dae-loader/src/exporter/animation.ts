import {Context} from "../context"
import {LogLevel} from "../log"

import * as Utils from "./utils"
import * as MathUtils from "../math"
import {AnimationTrack} from "./animation_track"
import { AnimationData } from "../converter/animation_data"
import { ExporterContext } from "./context"
import { AnimationJSON } from "./format"

    export class Animation {

        static toJSON(animation: AnimationData, context: ExporterContext): AnimationJSON {
            if (!animation) {
                return {
                    name: "",
                    frames: 0,
                    fps: 0,
                    tracks: undefined
                }
            }

            return {
                name: animation.name,
                frames: animation.keyframes,
                fps: animation.fps,
                tracks: animation.tracks.map((e, i) => AnimationTrack.toJSON(e, i, context))
            };
        }
    }
