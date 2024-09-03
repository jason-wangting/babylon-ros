
import { BindMaterial } from "./bind_material";
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { InstanceMaterial } from "./instance_material";
import { Link } from "./link";
import * as Utils from "./utils"

    export class InstanceGeometry extends EElement {
        geometry: Link | undefined;
        materials: InstanceMaterial[];

        constructor() {
            super();
            this._className += "InstanceGeometry|";
            this.materials = [];
        }

        /**
        *   Parses a <instance_geometry> element.
        */
        static parse(node: Node, parent: EElement, context: LoaderContext): InstanceGeometry {
            var result: InstanceGeometry = new InstanceGeometry();

            result.geometry = context.getAttributeAsUrlLink(node, "url", true);
            result.sid = context.getAttributeAsString(node, "sid", undefined, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "bind_material":
                        BindMaterial.parse(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    };
