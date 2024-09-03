import { LogLevel } from "../log"
import { LoaderContext } from "./context";
import { EElement } from "./element";
import { SidLink, UrlLink } from "./link";

import * as Utils from "./utils"

    export interface InstanceMaterialVertexInput {
        inputSemantic: string;
        inputSet: number;
    }

    export interface InstanceMaterialParam {
        target: SidLink;
    }

    export interface InstanceMaterialContainer extends EElement {
        materials: InstanceMaterial[];
    }

    export class InstanceMaterial extends EElement {
        material: UrlLink | undefined;
        symbol: string = "";
        /** Contains uniform parameters */
        params: { [s: string]: InstanceMaterialParam; }
        /** Contains vertex paramters */
        vertexInputs: { [s: string]: InstanceMaterialVertexInput; }

        constructor() {
            super();
            this._className += "InstanceMaterial|";
            this.params = {};
            this.vertexInputs = {};
        }

        /**
        *   Parses a <instance_material> element.
        */
        static parse(node: Node, parent: InstanceMaterialContainer, context: LoaderContext): InstanceMaterial {
            var result: InstanceMaterial = new InstanceMaterial();

            result.symbol = context.getAttributeAsString(node, "symbol", undefined, false);
            result.material = context.getAttributeAsUrlLink(node, "target", true);
            context.registerSidTarget(result, parent);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "bind_vertex_input":
                        InstanceMaterial.parseBindVertexInput(child, result, context);
                        break;
                    case "bind":
                        InstanceMaterial.parseBind(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        /**
        *   Parses a <instance_material>/<bind_vertex_input> element.
        */
        static parseBindVertexInput(node: Node, instanceMaterial: InstanceMaterial, context: LoaderContext) {
            var semantic: string = context.getAttributeAsString(node, "semantic", undefined, true);
            var inputSemantic: string = context.getAttributeAsString(node, "input_semantic", undefined, true);
            var inputSet: number | undefined = context.getAttributeAsInt(node, "input_set", 0, false);

            if ((semantic != null) && (inputSemantic != null) && inputSet) {
                instanceMaterial.vertexInputs[semantic] = {
                    inputSemantic: inputSemantic,
                    inputSet: inputSet
                };
            } else {
                context.log.write("Skipped a material vertex binding because of missing semantics.", LogLevel.Warning);
            }
        }

        /**
        *   Parses a <instance_material>/<bind> element.
        */
        static parseBind(node: Node, instanceMaterial: InstanceMaterial, context: LoaderContext) {
            var semantic: string = context.getAttributeAsString(node, "semantic", undefined, false);
            var target: SidLink | undefined = context.getAttributeAsSidLink(node, "target", "", true);

            if (semantic != null && target) {
                instanceMaterial.params[semantic] = {
                    target: target
                };
            } else {
                context.log.write("Skipped a material uniform binding because of missing semantics.", LogLevel.Warning);
            }
        }
    }
