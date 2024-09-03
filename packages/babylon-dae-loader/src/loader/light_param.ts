import { LoaderContext } from "./context";
import { EElement } from "./element";


    export class LightParam extends EElement {
        value: number| undefined;

        constructor() {
            super();
            this._className += "LightParam|";
        }

        /**
        *   Parses a light parameter element.
        */
        static parse(node: Node, context: LoaderContext): LightParam {
            var result: LightParam = new LightParam();

            result.sid = context.getAttributeAsString(node, "sid", undefined, false);
            result.name = node.nodeName;
            result.value = context.getFloatContent(node);

            return result;
        }

    }
