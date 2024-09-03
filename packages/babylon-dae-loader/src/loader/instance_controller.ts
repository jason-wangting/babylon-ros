
import { BindMaterial } from "./bind_material";
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { InstanceMaterial } from "./instance_material";
import { Link } from "./link";
import * as Utils from "./utils"

    export interface InstanceControllerContainer extends EElement {
        controllers: InstanceController[];
    }

    export class InstanceController extends EElement {
        controller: Link | undefined;
        skeletons: Link[];
        materials: InstanceMaterial[];

        constructor() {
            super();
            this._className += "InstanceController|";
            this.skeletons = [];
            this.materials = [];
        }

        /**
        *   Parses a <instance_controller> element.
        */
        static parse(node: Node, parent: InstanceControllerContainer, context: LoaderContext): InstanceController {
            var result: InstanceController = new InstanceController();

            result.controller = context.getAttributeAsUrlLink(node, "url", true);
            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerSidTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "skeleton":
                        result.skeletons.push(context.createUrlLink(context.getTextContent(child)));
                        break;
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
