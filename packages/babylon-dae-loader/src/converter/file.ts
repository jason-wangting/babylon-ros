import { Geometry } from "./geometry";
import { AnimationData } from "./animation_data";
import { Node } from "./node";
import { Animation } from "./animation";

export class Document {
        /** The scene graph */
        nodes: Node[];
        /** Animations (all original animation curves) */
        animations: Animation[];
        /** Animations (resampled node animations) */
        resampled_animations: AnimationData[];
        /** Geometries (detached from the scene graph) */
        geometries: Geometry[];

        constructor() {
            this.nodes = [];
            this.animations = [];
            this.geometries = [];
            this.resampled_animations = [];
        }
    }
