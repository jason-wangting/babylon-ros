import { Context } from "../context"
import { LogLevel } from "../log"
import { LoaderContext } from "./context";
import { EffectParam } from "./effect_param";
import { EffectTechnique } from "./effect_technique";
import { EElement } from "./element";
import { Link } from "./link";

import * as Utils from "./utils"

    /**
    *   An <effect> element.
    *
    */
    export class Effect extends EElement {
        params: EffectParam[];
        technique: EffectTechnique | undefined;

        constructor() {
            super();
            this._className += "Effect|";
            this.params = [];
        }

        static fromLink(link: Link, context: Context): Effect | undefined{
            return EElement._fromLink<Effect>(link, "Effect", context);
        }

        /**
        *   Parses an <effect> element.
        */
        static parse(node: Node, context: LoaderContext): Effect {
            var result: Effect = new Effect();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "profile_COMMON":
                        Effect.parseProfileCommon(child, result, context);
                        break;
                    case "profile":
                        context.log.write("Skipped non-common effect profile for effect " + result.id + ".", LogLevel.Warning);
                        break;
                    case "extra":
                        if (result.technique) {
                            EffectTechnique.parseExtra(child, result.technique, context);
                        }
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        /**
        *   Parses an <effect>/<profile_COMMON> element.
        */
        static parseProfileCommon(node: Node, effect: Effect, context: LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "newparam":
                        effect.params.push(EffectParam.parse(child, effect, context));
                        break;
                    case "technique":
                        effect.technique = EffectTechnique.parse(child, effect, context);
                        break;
                    case "extra":
                        if (effect.technique) {
                            EffectTechnique.parseExtra(child, effect.technique, context);
                        }
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }
    };

    export class EffectLibrary extends EElement {
        children: Effect[] = [];


        static parse(node: Node, context: LoaderContext): EffectLibrary {
            var result: EffectLibrary = new EffectLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "effect":
                        result.children.push(Effect.parse(child, context));
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
