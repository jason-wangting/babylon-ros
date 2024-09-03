import {Log, LogLevel} from "../log"


import * as Utils from "./utils"
import * as MathUtils from "../math"
import {Material} from "./material"
import * as LoaderMaterial from "../loader/material"
import {Texture} from "./texture"
import {AnimationTarget} from "./animation"
import * as COLLADAContext from "../context"
import {Options} from "./options"
import { EElement } from "../loader/element"
import { VisualSceneNode } from "../loader/visual_scene_node"
import { Node } from "../converter/node"
import { Image } from "../loader/image"

/**
    * A map that maps various COLLADA objects to converter objects
    * 
    * The converter does not store direct references to COLLADA objects,
    * so that the old COLLADA document can be garbage collected.
    */
    export class ObjectMap<ColladaType, ConverterType> {
        collada: ColladaType[];
        converter: ConverterType[];

        constructor() {
            this.collada = [];
            this.converter = [];
        }

        register(collada: ColladaType, converter: ConverterType) {
            this.collada.push(collada);
            this.converter.push(converter);
        }

        findConverter(collada: ColladaType): ConverterType {
            for (var i: number = 0; i < this.collada.length; ++i) {
                if (this.collada[i] === collada) return this.converter[i];
            }
            return null;
        }

        findCollada(converter: ConverterType): ColladaType {
            for (var i: number = 0; i < this.collada.length; ++i) {
                if (this.converter[i] === converter) return this.collada[i];
            }
            return null;
        }
    }

    export class ConverterContext extends COLLADAContext.Context {
        materials: ObjectMap<LoaderMaterial.Material, Material>;
        textures: ObjectMap<Image, Texture>;
        nodes: ObjectMap<VisualSceneNode, Node>;
        animationTargets: ObjectMap<EElement, AnimationTarget>;
        log: Log;
        options: Options;
        messageCount: { [name: string]: number };

        constructor(log: Log, options: Options) {
            super(log);
            this.log = log;
            this.options = options;
            this.materials = new ObjectMap<LoaderMaterial.Material, Material>();
            this.textures = new ObjectMap<Image, Texture>();
            this.nodes = new ObjectMap<VisualSceneNode, Node>();
            this.animationTargets = new ObjectMap<EElement, AnimationTarget>();
            this.messageCount = {};
        }
    }
