
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { Link } from "./link";
import * as Utils from "./utils"

    /**
    *   A <scene> element.
    */
    export class Scene extends EElement {
        instance: Link | undefined = undefined;

        constructor() {
            super();
            this._className += "Scene|";
        }

        static parse(node: Node, context: LoaderContext): Scene {
            var result: Scene = new Scene();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "instance_visual_scene":
                        result.instance = context.getAttributeAsUrlLink(child, "url", true);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                        break;
                }
            });

            return result;
        }
    };
