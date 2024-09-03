import { LogLevel } from "../log"

import { LoaderContext } from "./context"
import { EElement } from "./element"
import { Input } from "./input"
import * as Utils from "./utils"

    export class VertexWeights extends EElement {
        inputs: Input[];
        vcount: Int32Array = new Int32Array();
        v: Int32Array = new Int32Array();
        joints: Input | undefined = undefined;
        weights: Input | undefined = undefined;
        count: number = 0;

        constructor() {
            super();
            this._className += "VertexWeights|";
            this.inputs = [];
        }

        /**
        *   Parses a <vertex_weights> element.
        */
        static parse(node: Node, context: LoaderContext): VertexWeights {
            var result: VertexWeights = new VertexWeights();

            result.count = context.getAttributeAsInt(node, "count", 0, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        var input: Input = Input.parse(child, true, context);
                        VertexWeights.addInput(result, input, context);
                        break;
                    case "vcount":
                        result.vcount = context.getIntsContent(child);
                        break;
                    case "v":
                        result.v = context.getIntsContent(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        static addInput(weights: VertexWeights, input: Input, context: LoaderContext) {
            switch (input.semantic) {
                case "JOINT":
                    weights.joints = input;
                    break;
                case "WEIGHT":
                    weights.weights = input;
                    break;
                default:
                    context.log.write("Unknown vertex weights input semantic " + input.semantic, LogLevel.Error);
            }
        }
    }
