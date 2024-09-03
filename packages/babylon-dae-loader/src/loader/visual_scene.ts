import { Context } from "../context"

import { LoaderContext } from "./context"
import { EElement } from "./element"
import { Link } from "./link"
import * as Utils from "./utils"
import { VisualSceneNode } from "./visual_scene_node"

    /**
    *   An <visual_scene> element.
    */
    export class VisualScene extends EElement {
        children: VisualSceneNode[];

        constructor() {
            super();
            this._className += "VisualScene|";
            this.children = [];
        }

        static fromLink(link: Link, context: Context): VisualScene | undefined {
            return EElement._fromLink<VisualScene>(link, "VisualScene", context);
        }

        static parse(node: Node, context: LoaderContext): VisualScene {
            var result: VisualScene = new VisualScene();

            result.id = context.getAttributeAsString(node, "id", "", false);

            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "node":
                        var childNode: VisualSceneNode = VisualSceneNode.parse(child, context);
                        VisualSceneNode.registerParent(childNode, result, context);
                        result.children.push(childNode);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                        break;
                }
            });

            return result;
        }
    };

    export class VisualSceneLibrary extends EElement {
        children: VisualScene[] = [];

        static parse(node: Node, context: LoaderContext): VisualSceneLibrary {
            var result: VisualSceneLibrary = new VisualSceneLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "visual_scene":
                        result.children.push(VisualScene.parse(child, context));
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
