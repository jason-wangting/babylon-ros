import { AssetContainer, Engine, ISceneLoaderAsyncResult, ISceneLoaderPlugin, ISceneLoaderPluginAsync, ISceneLoaderPluginExtensions, ISceneLoaderProgressEvent, Scene, SceneLoader } from "@babylonjs/core";
import convertUrdfTextToRobot from "./converters/convert-urdf-to-robot";
export class URDFLoader implements ISceneLoaderPluginAsync{
    /**
     * Defines the name of the plugin.
     */ 
    name = "URDF";
    /**
     * URDF file extension name
     */
    extensions = '.urdf';

    /**
     * Imports one or more meshes from the loaded URDF data and adds them to the scene
     * custom babylon.js scene loader STANDARD interface
     * reference: https://doc.babylonjs.com/features/featuresDeepDive/importers/createImporters
     * @param meshesNames An array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
     * @param scene The scene to import into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param onProgress The callback when the load progresses
     * @param fileName Defines the name of the file to load
     * @returns The loaded objects (e.g. meshes, particle systems, skeletons, animation groups, etc.)
     */
    async importMeshAsync(meshesNames: string | readonly string[] | null | undefined, scene: Scene, data: unknown, rootUrl: string, onProgress?: (event: ISceneLoaderProgressEvent) => void, fileName?: string): Promise<ISceneLoaderAsyncResult> {
        console.log("importMeshAsync");
        const robot = await convertUrdfTextToRobot(data as string);
        robot.create(scene);
        return {
            meshes: [],
            particleSystems: [],
            skeletons: [],
            animationGroups: [],
            transformNodes: [],
            geometries: [],
            lights: [],
            spriteManagers: [],
        };
    }

    /**
     * Load into a scene.     
     * custom babylon.js scene loader STANDARD interface
     * reference: https://doc.babylonjs.com/features/featuresDeepDive/importers/createImporters
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param onProgress The callback when the load progresses
     * @param fileName Defines the name of the file to load
     * @returns Nothing
     */
    async loadAsync(scene: Scene, data: string, rootUrl: string, onProgress?: (event: ISceneLoaderProgressEvent) => void, fileName?: string): Promise<void> {
        console.log("loadAsync");
        await this.importMeshAsync(null, scene, data, rootUrl, onProgress, fileName)
    }

    /**
     * Load into an asset container from the loaded URDF data.
     * custom babylon.js scene loader STANDARD interface
     * reference: https://doc.babylonjs.com/features/featuresDeepDive/importers/createImporters
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param onProgress The callback when the load progresses
     * @param fileName Defines the name of the file to load
     * @returns The loaded asset container
     */
    async loadAssetContainerAsync(scene: Scene, data: unknown, rootUrl: string, onProgress?: (event: ISceneLoaderProgressEvent) => void, fileName?: string): Promise<AssetContainer> {
        console.log("loadAssetContainerAsync");
        const container = new AssetContainer(scene);
        return container;
    }
}
