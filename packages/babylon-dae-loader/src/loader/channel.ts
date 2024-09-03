
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { UrlLink, SidLink } from "./link";
import * as Utils from "./utils";
import {Animation} from "./animation";

    export class Channel extends EElement {
        source: UrlLink | undefined;
        target: SidLink | undefined;

        constructor() {
            super();
            this._className += "Channel|";
        }

        /**
        *   Parses a <channel> element.
        */
        static parse(node: Node, parent: Animation, context: LoaderContext): Channel {
            var result: Channel = new Channel();

            result.source = context.getAttributeAsUrlLink(node, "source", true);
            result.target = context.getAttributeAsSidLink(node, "target", parent.id, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
