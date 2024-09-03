import { LogLevel } from "../log"
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { Input } from "./input";

import * as Utils from "./utils"

    export class Joints extends EElement {
        joints: Input | undefined;
        invBindMatrices: Input | undefined;

        constructor() {
            super();
            this._className += "Joints|";
        }

        /**
        *   Parses a <joints> element.
        */
        static parse(node: Node, context: LoaderContext): Joints {
            var result: Joints = new Joints();

            var inputs: Input[] = [];

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        var input: Input = Input.parse(child, false, context);
                        Joints.addInput(result, input, context);
                        inputs.push(input);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        static addInput(joints: Joints, input: Input, context: LoaderContext) {
            switch (input.semantic) {
                case "JOINT":
                    joints.joints = input;
                    break;
                case "INV_BIND_MATRIX":
                    joints.invBindMatrices = input;
                    break;
                default:
                    context.log?.write("Unknown joints input semantic " + input.semantic, LogLevel.Error);
            }
        }

    }
