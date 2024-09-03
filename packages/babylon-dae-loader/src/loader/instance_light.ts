
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { Link } from "./link";
import * as Utils from "./utils"
import { VisualSceneNode } from "./visual_scene_node";

    export class InstanceLight extends EElement {
        light: Link | undefined;

        constructor() {
            super();
            this._className += "InstanceLight|";
        }

        /**
        *   Parses a <instance_light> element.
        */
        static parse(node: Node, parent: VisualSceneNode, context: LoaderContext): InstanceLight {
            var result: InstanceLight = new InstanceLight();

            result.light = context.getAttributeAsUrlLink(node, "url", true);
            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerSidTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "extra":
                        context.reportUnhandledChild(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    };
