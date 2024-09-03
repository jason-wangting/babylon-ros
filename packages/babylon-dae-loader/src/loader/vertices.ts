import { Context } from "../context"

import { LoaderContext } from "./context"
import { EElement } from "./element"
import { Input } from "./input"
import { Link } from "./link"
import * as Utils from "./utils"

    export class Vertices extends EElement {
        inputs: Input[];

        constructor() {
            super();
            this._className += "Vertices|";
            this.inputs = [];
        }

        static fromLink(link: Link, context: Context): Vertices | undefined {
            return EElement._fromLink<Vertices>(link, "Vertices", context);
        }

        /**
        *   Parses a <vertices> element.
        */
        static parse(node: Node, context: LoaderContext): Vertices {
            var result: Vertices = new Vertices();

            result.id = context.getAttributeAsString(node, "id", "", true);
            result.name = context.getAttributeAsString(node, "name", "", false);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        result.inputs.push(Input.parse(child, false, context));
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
