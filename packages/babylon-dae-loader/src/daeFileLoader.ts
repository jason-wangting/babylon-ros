import { promises as fs } from 'fs';
import * as BABYLON from "babylonjs";
import * as Loader from "./loader"
import {RMXModelLoader} from "./model-loader"
import * as BabylonLoader from "./babylon-loader"
import {RMXModel} from "./model"
import {LogLevel, LogCallback, LogFilter} from "./log"
import { ColladaConverter } from './converter/colladaconverter';
import { ColladaExporter } from './exporter/colladaexporter';
import { Document } from './loader/document';


export class DAEFileLoader implements BABYLON.ISceneLoaderPluginAsync, BABYLON.ISceneLoaderPluginFactory {
  public name = "dae";
  public extensions = ".dae";

  private _assetContainer: BABYLON.Nullable<BABYLON.AssetContainer> = null;

  createPlugin(): BABYLON.ISceneLoaderPluginAsync | BABYLON.ISceneLoaderPlugin {
    return new DAEFileLoader();
  }

  public importMeshAsync(meshesNames: any, scene: BABYLON.Scene, data: any, rootUrl: string): Promise<BABYLON.ISceneLoaderAsyncResult> {
    var loader = new Loader.ColladaLoader();
    var loaderlog = new LogCallback;
    loaderlog.onmessage = (message: string, level: LogLevel) => { console.log(message); }      
    loader.log = new LogFilter(loaderlog, LogLevel.Debug);
    
    var parser = new DOMParser();
    var colladaXml = parser.parseFromString(data, "text/xml");

    var colladaDoc = loader.loadFromXML("id", colladaXml);

    var converter = new ColladaConverter();
    var convertedDoc = converter.convert(colladaDoc);

    var exporter = new ColladaExporter();
    var exportedDoc = exporter.export(convertedDoc);

    var modelLoader = new RMXModelLoader;
    var model: RMXModel = modelLoader.loadModel(exportedDoc.json, exportedDoc.data.buffer);

    var loader2 = new BabylonLoader.BabylonModelLoader();
    var model2 = loader2.createBabylonModel(model, scene);


    const result: BABYLON.ISceneLoaderAsyncResult = {
      meshes: model2.meshes,
      particleSystems: [],
      skeletons: [model2.skeleton],
      animationGroups: [],
      transformNodes: [],
      geometries: [],
      lights: [],
    };
    return Promise.resolve(result);
  }  

  public loadAsync(scene: BABYLON.Scene, data: string, rootUrl: string): Promise<void> {
    //Get the 3D model
    return this.importMeshAsync(undefined, scene, data, rootUrl).then(() => {
        // return void
    });
  }

    public loadAssetContainerAsync(scene: BABYLON.Scene, data: string, rootUrl: string): Promise<BABYLON.AssetContainer> {
        const container = new BABYLON.AssetContainer(scene);
        this._assetContainer = container;

        return this.importMeshAsync(undefined, scene, data, rootUrl)
            .then((result) => {
                result.meshes.forEach((mesh) => {
                  container.meshes.push(mesh)
                });
                result.meshes.forEach((mesh) => {
                    const material = mesh.material;
                    if (material) {
                        // Materials
                        if (container.materials.indexOf(material) == -1) {
                            container.materials.push(material);

                            // Textures
                            const textures = material.getActiveTextures();
                            textures.forEach((t) => {
                                if (container.textures.indexOf(t) == -1) {
                                    container.textures.push(t);
                                }
                            });
                        }
                    }
                });

                this._assetContainer = null;
                return container;
            })
            .catch((ex) => {
                this._assetContainer = null;
                throw ex;
            });
    }

}

export function Register() {
  if (BABYLON.SceneLoader) {
    //Add this loader into the register plugin
    BABYLON.SceneLoader.RegisterPlugin(new DAEFileLoader());
  }
}
