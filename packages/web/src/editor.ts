import { Nullable } from "./shared/types";
import { 
    ArcRotateCamera, Color3, Engine, GizmoManager, 
    HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3
} from "@babylonjs/core";
import "@babylonjs/inspector";
import Loader from "./loader";

export default class Editor {
    /**
     * Reference to the Babylon.js engine used to render the preview scene.
     */
    public engine!: Engine;

    /**
     * Reference to the Babylon.js scene used to render the preview component
     */
    public scene!: Scene;

    /**
     * Reference to the active camera in the scene
     */
    public activeCamera: Nullable<ArcRotateCamera> = null;

    /**
     * Reference to the active light in the scene
     */
    public activeLight: Nullable<HemisphericLight> = null;

    /**
     * preview canvas element
     */
    public canvasElement: Nullable<HTMLCanvasElement> = null;

    /**
     * gizmo manager
     */
    public gizmoManager!: GizmoManager;

    /**
     * Reference to the loader
     */
    public loader: Loader = new Loader(this);


    /**
     * Initializes the editor
     */
    public init() {
        console.log("Initializing the editor");
        this.canvasElement = document.getElementById("preview-canvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvasElement, true);
        this.scene = new Scene(this.engine);
        this.engine.runRenderLoop(() => this.scene.render());


        // initialize the camera
        this._setArcRotateCamera();

        // initialize the light
        this._setLight();

        // create a ground
        this._createGround();

        // initialize the gizmo manager
        this._initGizmoManager();

        // initialize the loader
        this.loader.init();

        // expose the scene to the window object for debugging
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).scene = this.scene;

        this.scene.debugLayer.show();

    }
    dispose() {
        console.log("Disposing the editor");
        this.engine.dispose();
        this.scene.dispose();
        this.activeCamera = null;
        this.activeLight = null;
    }
    /**
     * create a new ArcRotateCamera and attach it to the scene
     * @returns 
     */
    private _setArcRotateCamera() {
        this.activeCamera =  new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new Vector3(0, 0, 0));
        this.scene.activeCamera = this.activeCamera;
        this.activeCamera.attachControl(this.canvasElement, true);
    }

    /**
     * create a new HemisphericLight and attach it to the scene
     * @returns 
     */
    private _setLight() {
        const light = new HemisphericLight("light", new Vector3(1, 1, 0), this.scene);
    }

    /**
     * Create a ground
     */
    private _createGround() {
        const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 });
        const mat = new StandardMaterial("mat", this.scene);
        mat.diffuseColor = new Color3(255, 255, 255);
        ground.material = mat;
    }

    /**
     * Initialize the gizmo manager
     */
    private _initGizmoManager() {
        this.gizmoManager = new GizmoManager(this.scene);
        this.gizmoManager.attachableMeshes = [];
    }

}
export const editor = new Editor();