
import { LoaderContext } from "./context"
import { EElement } from "./element"
import { Input } from "./input"
import * as Utils from "./utils"

    export class Triangles extends EElement {
        /** "triangles", "polylist", or "polygons" */
        type: string = "";
        count: number = 0;
        /** A material "symbol", bound by <bind_material> */
        material: string = "";
        inputs: Input[] = [];
        indices: Uint32Array = new Uint32Array();
        vcount: Uint32Array = new Uint32Array();

        constructor() {
            super();
            this._className += "Triangles|";
        }

        /**
        *   Parses a <triangles> element.
        */
        static parse(node: Node, context: LoaderContext): Triangles {
            var result: Triangles = new Triangles();

            result.name = context.getAttributeAsString(node, "name", undefined, false);
            result.material = context.getAttributeAsString(node, "material", undefined, false);
            result.count = context.getAttributeAsInt(node, "count", 0, true) || 0;
            result.type = node.nodeName;

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "input":
                        result.inputs.push(Input.parse(child, true, context));
                        break;
                    case "vcount":
                        result.vcount = context.getUintsContent(child);
                        break;
                    case "p":
                        result.indices = context.getUintsContent(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
