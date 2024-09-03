import { Channel } from "./channel"
import { LoaderContext } from "./context"
import { EElement } from "./element"
import { Sampler } from "./sampler"
import * as SourceLoader from "./source"
import * as Utils from "./utils"
import * as AnimationConverter from "../converter/animation"



    export class Animation extends EElement {
        parent: Animation | undefined;
        children: Animation[];
        sources: SourceLoader.Source[];
        samplers: Sampler[];
        channels: Channel[];

        constructor() {
            super();
            this._className += "Animation|";
            this.children = [];
            this.sources = [];
            this.samplers = [];
            this.channels = [];
        }

        root(): Animation {
            if (this.parent != null) {
                return this.parent.root();
            } else {
                return this;
            }
        }

        /**
        *   Parses an <animation> element.
        */
        static parse(node: Node, context: LoaderContext): Animation {
            var result: Animation = new Animation();

            result.id = context.getAttributeAsString(node, "id", undefined, false);
            result.name = context.getAttributeAsString(node, "name", undefined, false);

            context.registerUrlTarget(result, false);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "animation":
                        var animation: Animation = Animation.parse(child, context);
                        animation.parent = result;
                        result.children.push(animation);
                        break;
                    case "source":
                        result.sources.push(SourceLoader.Source.parse(child, context));
                        break;
                    case "sampler":
                        result.samplers.push(Sampler.parse(child, context));
                        break;
                    case "channel":
                        result.channels.push(Channel.parse(child, result, context));
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    };

    
    export class AnimationLibrary extends EElement {
        children: Animation[] = [];

        static parse(node: Node, context: LoaderContext): AnimationLibrary {
            var result: AnimationLibrary = new AnimationLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "animation":
                        result.children.push(Animation.parse(child, context));
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
