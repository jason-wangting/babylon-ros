import { Context } from "../context"

import { LoaderContext } from "./context"
import { EElement } from "./element"
import { InstanceCamera } from "./instance_camera"
import { InstanceController } from "./instance_controller"
import { InstanceGeometry } from "./instance_geometry"
import { InstanceLight } from "./instance_light"
import { Link } from "./link"
import { NodeTransform } from "./node_transform"
import * as Utils from "./utils"


    /**
    *   A <node> element (child of <visual_scene>, <library_nodes>, or another <node>).
    */
    export class VisualSceneNode extends EElement {
        type: string;
        layer: string;
        children: VisualSceneNode[];
        parent: EElement | undefined;
        transformations: NodeTransform[];
        geometries: InstanceGeometry[];
        controllers: InstanceController[];
        lights: InstanceLight[];
        cameras: InstanceCamera[];

        constructor() {
            super();
            this._className += "VisualSceneNode|";
            this.type = "";
            this.layer = "";
            this.children = [];
            this.parent = undefined;
            this.transformations = [];
            this.geometries = [];
            this.controllers = [];
            this.lights = [];
            this.cameras = [];
        }

        static fromLink(link: Link, context: Context): VisualSceneNode | undefined {
            return EElement._fromLink<VisualSceneNode>(link, "VisualSceneNode", context);
        }

        static registerParent(child: VisualSceneNode, parent: EElement, context: LoaderContext) {
            child.parent = parent;
            context.registerSidTarget(child, parent);
        }

        static parse(node: Node, context: LoaderContext): VisualSceneNode {
            var result: VisualSceneNode = new VisualSceneNode();

            result.id = context.getAttributeAsString(node, "id", undefined, false);
            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            result.type = context.getAttributeAsString(node, "type", undefined, false);
            result.layer = context.getAttributeAsString(node, "layer", undefined, false);

            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "instance_geometry":
                        result.geometries.push(InstanceGeometry.parse(child, result, context));
                        break;
                    case "instance_controller":
                        result.controllers.push(InstanceController.parse(child, result, context));
                        break;
                    case "instance_light":
                        result.lights.push(InstanceLight.parse(child, result, context));
                        break;
                    case "instance_camera":
                        result.cameras.push(InstanceCamera.parse(child, result, context));
                        break;
                    case "matrix":
                    case "rotate":
                    case "translate":
                    case "scale":
                        result.transformations.push(NodeTransform.parse(child, result, context));
                        break;
                    case "node":
                        var childNode: VisualSceneNode = VisualSceneNode.parse(child, context);
                        VisualSceneNode.registerParent(childNode, result, context);
                        result.children.push(childNode);
                        break;
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


    export class VisualSceneNodeLibrary extends EElement {
        children: VisualSceneNode[] = [];

        static parse(node: Node, context: LoaderContext): VisualSceneNodeLibrary {
            var result: VisualSceneNodeLibrary = new VisualSceneNodeLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "node":
                        result.children.push(VisualSceneNode.parse(child, context));
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
