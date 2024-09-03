import { LoaderContext } from "./context";
import { EElement } from "./element";

    export class CameraParam extends EElement {
        value: number = 0;

        constructor() {
            super();
            this._className += "CameraParam|";
        }

        /**
        *   Parses a camera parameter element.
        */
        static parse(node: Node, context: LoaderContext): CameraParam {
            var result: CameraParam = new CameraParam();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = node.nodeName;
            result.value = parseFloat(context.getTextContent(node));

            return result;
        }

    }
