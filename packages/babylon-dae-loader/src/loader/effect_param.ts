import { Context } from "../context"
import { LoaderContext } from "./context";
import { EffectSampler } from "./effect_sampler";
import { EffectSurface } from "./effect_surface";
import { EElement } from "./element";
import { Link } from "./link";

import * as Utils from "./utils"


    /**
    *   An <newparam> element.
    *
    */
    export class EffectParam extends EElement {
        semantic: string| undefined;
        surface: EffectSurface| undefined;
        sampler: EffectSampler| undefined;
        floats: Float32Array| undefined;

        constructor() {
            super();
            this._className += "EffectParam|";
        }

        static fromLink(link: Link, context: Context): EffectParam | undefined {
            return EElement._fromLink<EffectParam>(link, "EffectParam", context);
        }

        /**
        *   Parses a <newparam> element.
        */
        static parse(node: Node, parent: EElement, context: LoaderContext): EffectParam {
            var result: EffectParam = new EffectParam();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            context.registerFxTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "semantic":
                        result.semantic = context.getTextContent(child);
                        break;
                    case "float":
                        result.floats = context.getFloatsContent(child);
                        break;
                    case "float2":
                        result.floats = context.getFloatsContent(child);
                        break;
                    case "float3":
                        result.floats = context.getFloatsContent(child);
                        break;
                    case "float4":
                        result.floats = context.getFloatsContent(child);
                        break;
                    case "surface":
                        result.surface = EffectSurface.parse(child, result, context);
                        break;
                    case "sampler2D":
                        result.sampler = EffectSampler.parse(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    }
