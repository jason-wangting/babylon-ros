import { Scene } from "./scene"
import { LogLevel } from "../log"
import { AnimationLibrary } from "./animation"
import { Asset } from "./asset"
import { CameraLibrary } from "./camera"
import { LoaderContext } from "./context"
import { ControllerLibrary } from "./controller"
import { EffectLibrary } from "./effect"
import { GeometryLibrary } from "./geometry"
import { ImageLibrary } from "./image"
import { LightLibrary } from "./light"
import { MaterialLibrary } from "./material"
import * as Utils from "./utils"
import { VisualSceneLibrary } from "./visual_scene"
import { VisualSceneNodeLibrary } from "./visual_scene_node"


    export class Document {
        scene: Scene | undefined;
        asset: Asset | undefined;
        libEffects: EffectLibrary;
        libMaterials: MaterialLibrary;
        libGeometries: GeometryLibrary;
        libControllers: ControllerLibrary;
        libLights: LightLibrary;
        libCameras: CameraLibrary;
        libImages: ImageLibrary;
        libVisualScenes: VisualSceneLibrary;
        libAnimations: AnimationLibrary;
        libNodes: VisualSceneNodeLibrary;

        constructor() {
            this.libEffects = new EffectLibrary();
            this.libMaterials = new MaterialLibrary();
            this.libGeometries = new GeometryLibrary();
            this.libControllers = new ControllerLibrary();
            this.libLights = new LightLibrary();
            this.libCameras = new CameraLibrary;
            this.libImages = new ImageLibrary;
            this.libVisualScenes = new VisualSceneLibrary;
            this.libAnimations = new AnimationLibrary;
            this.libNodes = new VisualSceneNodeLibrary();
        }

        static parse(doc: XMLDocument, context: LoaderContext): Document {

            // There should be one top level <COLLADA> element
            var colladaNodes = doc.getElementsByTagName("COLLADA");
            if (colladaNodes.length === 0) {
                context.log?.write("Cannot parse document, no top level COLLADA element.", LogLevel.Error);
                return new Document();
            } else if (colladaNodes.length > 1) {
                context.log?.write("Cannot parse document, more than one top level COLLADA element.", LogLevel.Error);
                return new Document();
            }

            return Document.parseCOLLADA(colladaNodes[0] || colladaNodes.item(0), context);
        }

        static parseCOLLADA(node: Node, context: LoaderContext): Document {
            var result: Document = new Document();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "asset":
                        result.asset = Asset.parse(child, context);
                        break;
                    case "scene":
                        result.scene = Scene.parse(child, context);
                        break;
                    case "library_effects":
                        result.libEffects = EffectLibrary.parse(child, context);
                        break;
                    case "library_materials":
                        result.libMaterials = MaterialLibrary.parse(child, context);
                        break;
                    case "library_geometries":
                        result.libGeometries = GeometryLibrary.parse(child, context);
                        break;
                    case "library_images":
                        result.libImages = ImageLibrary.parse(child, context);
                        break;
                    case "library_visual_scenes":
                        result.libVisualScenes = VisualSceneLibrary.parse(child, context);
                        break;
                    case "library_controllers":
                        result.libControllers = ControllerLibrary.parse(child, context);
                        break;
                    case "library_animations":
                        result.libAnimations = AnimationLibrary.parse(child, context);
                        break;
                    case "library_lights":
                        result.libLights = LightLibrary.parse(child, context);
                        break;
                    case "library_cameras":
                        result.libCameras = CameraLibrary.parse(child, context);
                        break;
                    case "library_nodes":
                        result.libNodes = VisualSceneNodeLibrary.parse(child, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }
    };
