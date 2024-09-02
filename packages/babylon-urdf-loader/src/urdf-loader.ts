import { AssetContainer, Engine, ISceneLoaderAsyncResult, ISceneLoaderPluginAsync, ISceneLoaderProgressEvent, Scene } from "@babylonjs/core";
import { deserializeUrdfToRobot } from "./deserialize";
import { Robot } from "./objects/Robot";
export class URDFLoader implements ISceneLoaderPluginAsync{
    /**
     * weather wrap a transformNode for a link or not
     */
    static Wrap_TransfromNode_For_Link = false;
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
        const robot = new Robot(scene);
        robot.filename = fileName || "";
        robot.rootUrl = rootUrl;
        await deserializeUrdfToRobot(data as string, robot);
        await robot.create();
        const { loadedMeshes, loadedTransformNodes, loadedSkeletons } = robot.getResult();
        return {
            meshes: loadedMeshes,
            particleSystems: [],
            skeletons: loadedSkeletons,
            animationGroups: [],
            transformNodes: loadedTransformNodes,
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
        const {
            meshes
        } = await this.importMeshAsync(
            null,
            scene,
            data,
            rootUrl,
            onProgress,
            fileName
        );
        meshes.forEach(mesh => {
            container.meshes.push(mesh);
        });
        meshes.forEach(mesh => {
            const material = mesh.material;
            if (material && container.materials.indexOf(material) === -1) {
                container.materials.push(material);

                // Textures
                const textures = material.getActiveTextures();
                textures.forEach(t => {
                    if (container.textures.indexOf(t) === -1) {
                        container.textures.push(t);
                    }
                })
            }
        });
        return container;
    }
}
