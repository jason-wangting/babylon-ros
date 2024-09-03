
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { Link } from "./link";
import * as Utils from "./utils";

    export class ColorOrTexture extends EElement {
        color: Float32Array | undefined;
        textureSampler: Link | undefined;
        texcoord: string = "";
        opaque: string = "";
        bumptype: string = "";

        constructor() {
            super();
            this._className += "ColorOrTexture|";
        }

        /**
        *   Parses a color or texture element  (<ambient>, <diffuse>, ...).
        */
        static parse(node: Node, parent: EElement, context: LoaderContext): ColorOrTexture {
            var result: ColorOrTexture = new ColorOrTexture();

            result.opaque = context.getAttributeAsString(node, "opaque", undefined, false);
            result.bumptype = context.getAttributeAsString(node, "bumptype", undefined, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "color":
                        result.color = context.strToColor(context.getTextContent(child));
                        break;
                    case "texture":
                        result.textureSampler = context.getAttributeAsFxLink(child, "texture", parent, true);
                        result.texcoord = context.getAttributeAsString(child, "texcoord", undefined, true);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    }
