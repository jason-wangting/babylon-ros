
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { Joints } from "./joints";
import { UrlLink } from "./link";
import * as SourceLoader from "./source"
import * as Utils from "./utils"
import { VertexWeights } from "./vertex_weights";

    export class Skin extends EElement {
        source: UrlLink | undefined;
        bindShapeMatrix: Float32Array = new Float32Array();
        sources: SourceLoader.Source[] | undefined;
        joints: Joints | undefined;
        vertexWeights: VertexWeights | undefined;

        constructor() {
            super();
            this._className += "Skin|";
        }

        /**
        *   Parses a <skin> element.
        */
        static parse(node: Node, context: LoaderContext): Skin {
            var result: Skin = new Skin();

            result.source = context.getAttributeAsUrlLink(node, "source", true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "bind_shape_matrix":
                        result.bindShapeMatrix = context.getFloatsContent(child);
                        break;
                    case "source":
                        result.sources?.push(SourceLoader.Source.parse(child, context));
                        break;
                    case "joints":
                        result.joints = Joints.parse(child, context);
                        break;
                    case "vertex_weights":
                        result.vertexWeights = VertexWeights.parse(child, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

    }
