
import { LoaderContext } from "./context"
import { EElement } from "./element"
import * as Utils from "./utils"

    /**
    *   A template for a COLLADA element class. No actual use.
    */
    export class ElementTemplate extends EElement {
        member: any;

        constructor() {
            super();
            this._className += "ElementTemplate|";
            this.member = null;
        }

        /**
        *   Parses a <...> element.
        */
        static parse(node: Node, context: LoaderContext): ElementTemplate {
            var result: ElementTemplate = new ElementTemplate();

            result.id = context.getAttributeAsString(node, "id", undefined, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "childnode":
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
