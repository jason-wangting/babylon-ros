import { LoaderContext } from "./context";
import { EElement } from "./element";
import { UrlLink } from "./link";



    export class Input extends EElement {
        /** "VERTEX", "POSITION", "NORMAL", "TEXCOORD", ... */
        semantic: string = "";
        /** URL of source object */
        source: UrlLink | undefined;
        /** Offset in index array */
        offset: number = 0;
        /** Optional set identifier */
        set: number = 0;

        constructor() {
            super();
            this._className += "Input|";
        }

        /**
        *   Parses an <input> element.
        */
        static parse(node: Node, shared: boolean, context: LoaderContext): Input {
            var result: Input = new Input();

            result.semantic = context.getAttributeAsString(node, "semantic", undefined, true);
            result.source = context.getAttributeAsUrlLink(node, "source", true);

            if (shared) {
                result.offset = context.getAttributeAsInt(node, "offset", 0, true);
                result.set = context.getAttributeAsInt(node, "set", 0, false);
            }

            return result;
        }
    }
