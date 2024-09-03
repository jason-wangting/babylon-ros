import { ExporterContext } from "./context";
import { MaterialJSON } from "./format";
import * as ConverterMaterial from "../converter/material";

    export class Material {

        static toJSON(material: ConverterMaterial.Material, context: ExporterContext): MaterialJSON | undefined{
            if (!material) {
                return null;
            }

            return {
                name: material.name,
                diffuse: (material.diffuse !== null) ? (material.diffuse.url) : "",
                specular: (material.specular !== null) ? (material.specular.url) : "",
                normal: (material.normal !== null) ? (material.normal.url) : "",
                diffuseColor: material.diffuseColor,
                specularColor: material.specularColor,
                emissiveColor: material.emissiveColor
            };
        }
    };
