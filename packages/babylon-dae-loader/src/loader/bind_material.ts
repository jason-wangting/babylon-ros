import { LoaderContext } from "./context";
import { InstanceMaterial, InstanceMaterialContainer } from "./instance_material";
import * as Utils from "./utils";


    export class BindMaterial {

        /**
        *   Parses a <bind_material> element. Can be child of <instance_geometry> or <instance_controller>
        */
        static parse(node: Node, parent: InstanceMaterialContainer, context: LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "technique_common":
                        BindMaterial.parseTechniqueCommon(child, parent, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }

        /**
        *   Parses a <instance_geometry>/<bind_material>/<technique_common> element.
        */
        static parseTechniqueCommon(node: Node, parent: InstanceMaterialContainer, context: LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "instance_material":
                        parent.materials.push(InstanceMaterial.parse(child, parent, context));
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }
    }
