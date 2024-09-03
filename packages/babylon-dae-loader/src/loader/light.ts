
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { LightParam } from "./light_param";
import * as Utils from "./utils"

export class Light extends EElement {
        type: string | undefined;
        color: Float32Array | undefined;
        params: { [s: string]: LightParam; }

        constructor() {
            super();
            this._className += "Light|";
            this.params = {};
        }

        /**
        *   Parses a <light> element.
        */
        static parse(node: Node, context: LoaderContext): Light {
            var result: Light = new Light();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "technique_common":
                        Light.parseTechniqueCommon(child, result, context);
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
        *   Parses a <light>/<technique_common> element.
        */
        static parseTechniqueCommon(node: Node, light: Light, context: LoaderContext) {

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "ambient":
                    case "directional":
                    case "point":
                    case "spot":
                        Light.parseParams(child, light, "COMMON", context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

        }

        /**
        *   Parses a <light>/<technique_common>/(<ambient>|<directional>|<point>|<spot>) element.
        */
        static parseParams(node: Node, light: Light, profile: string, context: LoaderContext) {

            light.type = node.nodeName;

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "color":
                        light.color = context.getFloatsContent(child);
                        break;
                    case "constant_attenuation":
                    case "linear_attenuation":
                    case "quadratic_attenuation":
                    case "falloff_angle":
                    case "falloff_exponent":
                        var param: LightParam = LightParam.parse(child, context);
                        context.registerSidTarget(param, light);
                        light.params[param.name] = param;
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

        }

    }


    export class LightLibrary extends EElement {
        children: Light[] = [];

        static parse(node: Node, context: LoaderContext): LightLibrary {
            var result: LightLibrary = new LightLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "effect": //"light": // Polyhobbyist - this is what it was called in the code.
                        result.children.push(Light.parse(child, context));
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
