import { Context } from "../context"
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { Link } from "./link";

import * as Utils from "./utils"

    export class Material extends EElement {
        effect: Link | undefined;

        constructor() {
            super();
            this._className += "Material|";
        }

        static fromLink(link: Link, context: Context): Material | undefined {
            return EElement._fromLink<Material>(link, "Material", context);
        }

        /**
        *   Parses a <material> element.
        */
        static parse(node: Node, context: LoaderContext): Material {
            var result: Material = new Material();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "instance_effect":
                        result.effect = context.getAttributeAsUrlLink(child, "url", true);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    };

    
export class MaterialLibrary extends EElement {
    children: Material[] = [];

    static parse(node: Node, context: LoaderContext): MaterialLibrary {
        var result: MaterialLibrary = new MaterialLibrary();

        Utils.forEachChild(node, function (child: Node) {
            switch (child.nodeName) {
                case "material":
                    result.children.push(Material.parse(child, context));
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
