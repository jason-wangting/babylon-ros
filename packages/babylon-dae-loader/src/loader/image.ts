import { Context } from "../context"
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { Link } from "./link";

import * as Utils from "./utils"


    export class Image extends EElement {
        initFrom: string | undefined;

        constructor() {
            super();
            this._className += "Image|";
        }

        static fromLink(link: Link, context: Context): Image  | undefined{
            return EElement._fromLink<Image>(link, "Image", context);
        }

        /**
        *   Parses an <image> element.
        */
        static parse(node: Node, context: LoaderContext): Image {
            var result: Image = new Image();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "init_from":
                        result.initFrom = context.getTextContent(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }

    export class ImageLibrary extends EElement {
        children: Image[] = [];

        static parse(node: Node, context: LoaderContext): ImageLibrary {
            var result: ImageLibrary = new ImageLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "image":
                        result.children.push(Image.parse(child, context));
                        break;
                    case "extra":
                        context.reportUnhandledChild(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                        break;
                }
            });

            return result;
        }
    }
