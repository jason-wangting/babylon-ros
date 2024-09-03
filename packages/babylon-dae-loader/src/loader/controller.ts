import { Context } from "../context"
import { LogLevel } from "../log"
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { Link } from "./link";
import { Morph } from "./morph";
import { Skin } from "./skin";

import * as Utils from "./utils"



    export class Controller extends EElement {
        skin: Skin | undefined;
        morph: Morph | undefined;

        constructor() {
            super();
            this._className += "Controller|";
        }

        static fromLink(link: Link, context: Context): Controller | undefined {
            return EElement._fromLink<Controller>(link, "Controller", context);
        }

        /**
        *   Parses a <controller> element.
        */
        static parse(node: Node, context: LoaderContext): Controller {
            var result: Controller = new Controller();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "skin":
                        if (result.skin != null) {
                            context.log.write("Controller " + result.id + " has multiple skins", LogLevel.Error);
                        }
                        result.skin = Skin.parse(child, context);
                        break;
                    case "morph":
                        if (result.morph != null) {
                            context.log.write("Controller " + result.id + " has multiple morphs", LogLevel.Error);
                        }
                        result.morph = Morph.parse(child, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }

    export class ControllerLibrary extends EElement {
        children: Controller[];


        static parse(node: Node, context: LoaderContext): ControllerLibrary {
            var result: ControllerLibrary = new ControllerLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "controller":
                        result.children.push(Controller.parse(child, context));
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
