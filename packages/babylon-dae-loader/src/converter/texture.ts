import {Log, LogLevel} from "../log"
import * as Utils from "./utils"
import * as MathUtils from "../math"
import {Bone} from "./bone"
import {AnimationTarget} from "./animation"
import * as COLLADAContext from "../context"
import {Options} from "./options"
import {BoundingBox} from "./bounding_box"
import { ColorOrTexture } from "../loader/color_or_texture"
import { EffectParam } from "../loader/effect_param"
import { EffectSampler } from "../loader/effect_sampler"
import { EffectSurface } from "../loader/effect_surface"
import { ConverterContext } from "./context"
import {Image} from "../loader/image"

export class Texture {
        id: string;
        url: string;

        constructor(img: Image) {
            this.id = img.id;
            this.url = "";
        }

        static createTexture(colorOrTexture: ColorOrTexture, context: ConverterContext): Texture {
            if (!colorOrTexture || !colorOrTexture.textureSampler) {
                return null;
            }
            var textureSamplerParam: EffectParam = EffectParam.fromLink(colorOrTexture.textureSampler, context);
            if (!textureSamplerParam) {
                context.log.write("Texture sampler not found, texture will be missing", LogLevel.Warning);
                return null;
            }
            var textureSampler: EffectSampler = textureSamplerParam.sampler;
            if (!textureSampler) {
                context.log.write("Texture sampler param has no sampler, texture will be missing", LogLevel.Warning);
                return null;
            }
            var textureImage: Image = null;
            if (textureSampler.image != null) {
                // Collada 1.5 path: texture -> sampler -> image
                textureImage = Image.fromLink(textureSampler.image, context);
                if (!textureImage) {
                    context.log.write("Texture image not found, texture will be missing", LogLevel.Warning);
                    return null;
                }
            } else if (textureSampler.surface != null) {
                // Collada 1.4 path: texture -> sampler -> surface -> image
                var textureSurfaceParam: EffectParam = EffectParam.fromLink(textureSampler.surface, context);
                if (!textureSurfaceParam) {
                    context.log.write("Texture surface not found, texture will be missing", LogLevel.Warning);
                    return null;
                }
                var textureSurface: EffectSurface = textureSurfaceParam.surface;
                if (!textureSurface) {
                    context.log.write("Texture surface param has no surface, texture will be missing", LogLevel.Warning);
                    return null;
                }
                textureImage = Image.fromLink(textureSurface.initFrom, context);
                if (!textureImage) {
                    context.log.write("Texture image not found, texture will be missing", LogLevel.Warning);
                    return null;
                }
            }

            var result: Texture = context.textures.findConverter(textureImage);
            if (result) return result;

            result = new Texture(textureImage);
            result.url = textureImage.initFrom;
            if (context.options.removeTexturePath.value === true) {
                result.url = result.url.replace(/^.*[\\\/]/, '');
            }
            context.textures.register(textureImage, result);

            return result;
        }
    }
