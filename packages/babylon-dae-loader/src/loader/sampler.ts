import { Context } from "../context"
import { LogLevel } from "../log"
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { Input } from "./input";
import { Link } from "./link";

import * as Utils from "./utils"

    export class Sampler extends EElement {
        input: Input | undefined;
        outputs: Input[];
        inTangents: Input[];
        outTangents: Input[];
        interpolation: Input | undefined;

        constructor() {
            super();
            this._className += "Sampler|";
            this.outputs = [];
            this.inTangents = [];
            this.outTangents = [];
        }

        static fromLink(link: Link, context: Context): Sampler | undefined{
            return EElement._fromLink<Sampler>(link, "Sampler", context);
        }

        /**
        *   Parses a <sampler> element.
        */
        static parse(node: Node, context: LoaderContext): Sampler {
            var result: Sampler = new Sampler();

            result.id = context.getAttributeAsString(node, "id", undefined, false);
            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        var input: Input = Input.parse(child, false, context);
                        Sampler?.addInput(result, input, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        static addInput(sampler: Sampler, input: Input, context: LoaderContext) {
            switch (input.semantic) {
                case "INPUT":
                    sampler.input = input;
                    break;
                case "OUTPUT":
                    sampler.outputs.push(input);
                    break;
                case "INTERPOLATION":
                    sampler.interpolation = input;
                    break;
                case "IN_TANGENT":
                    sampler.inTangents.push(input);
                    break;
                case "OUT_TANGENT":
                    sampler.outTangents.push(input);
                    break;
                default:
                    context.log.write("Unknown sampler input semantic " + input.semantic, LogLevel.Error);
            }
        }

    }
