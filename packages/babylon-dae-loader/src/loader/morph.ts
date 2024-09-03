import { LogLevel } from "../log"
import { LoaderContext } from "./context";
import { EElement } from "./element";


    export class Morph extends EElement {

        constructor() {
            super();
            this._className += "Morph|";
        }

        /**
        *   Parses a <morph> element.
        */
        static parse(node: Node, context: LoaderContext): Morph {
            var result: Morph = new Morph();

            context.log.write("Morph controllers not implemented", LogLevel.Error);

            return result;
        }

    }
