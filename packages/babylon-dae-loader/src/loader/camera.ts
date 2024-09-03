import { CameraParam } from "./camera_param";
import { LoaderContext } from "./context";
import { EElement } from "./element";
import * as Utils from "./utils";

    export class Camera extends EElement {
        type: string = "";
        params: { [s: string]: CameraParam; }

        constructor() {
            super();
            this._className += "Camera|";
            this.params = {};
        }

        /**
        *   Parses a <camera> element.
        */
        static parse(node: Node, context: LoaderContext): Camera {
            var result: Camera = new Camera();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "asset":
                        context.reportUnhandledChild(child);
                        break;
                    case "optics":
                        Camera.parseOptics(child, result, context);
                        break;
                    case "imager":
                        context.reportUnhandledChild(child);
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

        /**
        *   Parses a <camera>/<optics> element.
        */
        static parseOptics(node: Node, camera: Camera, context: LoaderContext) {

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "technique_common":
                        Camera.parseTechniqueCommon(child, camera, context);
                        break;
                    case "technique":
                        context.reportUnhandledChild(child);
                        break;
                    case "extra":
                        context.reportUnhandledChild(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

        }

        /**
        *   Parses a <camera>/<optics>/<technique_common> element.
        */
        static parseTechniqueCommon(node: Node, camera: Camera, context: LoaderContext) {

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "orthographic":
                        Camera.parseParams(child, camera, context);
                        break;
                    case "perspective":
                        Camera.parseParams(child, camera, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

        }

        /**
        *   Parses a <camera>/<optics>/<technique_common>/(<orthographic>|<perspective>) element.
        */
        static parseParams(node: Node, camera: Camera, context: LoaderContext) {

            camera.type = node.nodeName;

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "xmag":
                    case "ymag":
                    case "xfov":
                    case "yfov":
                    case "aspect_ratio":
                    case "znear":
                    case "zfar":
                        var param: CameraParam = CameraParam.parse(child, context);
                        context.registerSidTarget(param, camera);
                        camera.params[param.name] = param;
                        break;
                    case "extra":
                        context.reportUnhandledChild(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

        }
    }

    export class CameraLibrary extends EElement {
        children: Camera[] = [];


        static parse(node: Node, context: LoaderContext): CameraLibrary {
            var result: CameraLibrary = new CameraLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "camera":
                        result.children.push(Camera.parse(child, context));
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
