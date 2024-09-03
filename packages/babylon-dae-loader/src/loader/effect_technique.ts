import { Context } from "../context"
import { LogLevel } from "../log"
import { ColorOrTexture } from "./color_or_texture";
import { LoaderContext } from "./context";
import { EffectParam } from "./effect_param";
import { EElement } from "./element";
import { Link } from "./link";

import * as Utils from "./utils"

    /**
    *   An <technique> element.
    *
    */
    export class EffectTechnique extends EElement {
        params: EffectParam[] | undefined;
        shading: string = "";
        emission: ColorOrTexture | undefined;
        ambient: ColorOrTexture | undefined;
        diffuse: ColorOrTexture | undefined;
        specular: ColorOrTexture | undefined;
        reflective: ColorOrTexture | undefined;
        transparent: ColorOrTexture | undefined;
        bump: ColorOrTexture | undefined;
        shininess: number = 0;
        transparency: number = 0;
        reflectivity: number = 0;
        index_of_refraction: number = 0;
        double_sided: boolean = false;

        constructor() {
            super();
            this._className += "EffectTechnique|";
            this.params = [];
        }

        static fromLink(link: Link, context: Context): EffectTechnique | undefined{
            return EElement._fromLink<EffectTechnique>(link, "EffectTechnique", context);
        }

        /**
        *   Parses a <technique> element.
        */
        static parse(node: Node, parent: EElement, context: LoaderContext): EffectTechnique {
            var result: EffectTechnique = new EffectTechnique();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            context.registerFxTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "blinn":
                    case "phong":
                    case "lambert":
                    case "constant":
                        result.shading = child.nodeName;
                        EffectTechnique.parseParam(child, result, "COMMON", context);
                        break;
                    case "extra":
                        EffectTechnique.parseExtra(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        /**
        *   Parses a <technique>/(<blinn>|<phong>|<lambert>|<constant>) element.
        *   In addition to <technique>, node may also be child of <technique>/<extra>
        */
        static parseParam(node: Node, technique: EffectTechnique, profile: string, context: LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "newparam":
                        technique.params?.push(EffectParam.parse(child, technique, context));
                        break;
                    case "emission":
                        technique.emission = ColorOrTexture.parse(child, technique, context);
                        break;
                    case "ambient":
                        technique.ambient = ColorOrTexture.parse(child, technique, context);
                        break;
                    case "diffuse":
                        technique.diffuse = ColorOrTexture.parse(child, technique, context);
                        break;
                    case "specular":
                        technique.specular = ColorOrTexture.parse(child, technique, context);
                        break;
                    case "reflective":
                        technique.reflective = ColorOrTexture.parse(child, technique, context);
                        break;
                    case "transparent":
                        technique.transparent = ColorOrTexture.parse(child, technique, context);
                        break;
                    case "bump":
                        technique.bump = ColorOrTexture.parse(child, technique, context);
                        break;
                    case "shininess":
                        technique.shininess = context.getFloatContent(child.childNodes[1] || child.childNodes.item(0));
                        break;
                    case "reflectivity":
                        technique.reflectivity = context.getFloatContent(child.childNodes[1] || child.childNodes.item(0));
                        break;
                    case "transparency":
                        technique.transparency = context.getFloatContent(child.childNodes[1] || child.childNodes.item(0));
                        break;
                    case "index_of_refraction":
                        technique.index_of_refraction = context.getFloatContent(child.childNodes[1] || child.childNodes.item(0));
                        break;
                    case "double_sided":
                        technique.double_sided = context.getFloatContent(child) > 0;
                        break;
                    default:
                        if (profile === "COMMON") {
                            context.reportUnexpectedChild(child);
                        }
                }
            });
        }

        /**
        *   Parses a <technique>/<extra> element.
        */
        static parseExtra(node: Node, technique: EffectTechnique, context: LoaderContext) {
            if (technique == null) {
                context.log.write("Ignored element <extra>, because there is no <technique>.", LogLevel.Warning);
                return;
            }

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "technique":
                        var profile: string = context.getAttributeAsString(child, "profile", undefined, true);
                        EffectTechnique.parseParam(child, technique, profile, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }
    }
