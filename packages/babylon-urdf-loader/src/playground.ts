class Playground {
    // public static async CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): Promise<BABYLON.Scene> {
    //     await new Promise((resolve) => {
    //         const loaderScript = document.createElement("script");
    //         loaderScript.src = "  https://www.unpkg.com/babylon-urdf-loader@latest/dist/urdf-loader.umd.js";
    //         document.head.appendChild(loaderScript);
    //         loaderScript.onload = resolve;
    //     });
    //     // register urdf loader plugin
    //     BABYLON.SceneLoader.RegisterPlugin(new (window as any).URDFLoader.URDFLoader());
    //     var scene = new BABYLON.Scene(engine);

    //     var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    //     camera.setTarget(BABYLON.Vector3.Zero());

    //     camera.attachControl(canvas, true);

    //     var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    //     light.intensity = 0.7;

    //     var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

    //     const mmdMesh = await BABYLON.SceneLoader.ImportMeshAsync(
    //         undefined,
    //         "https://raw.githubusercontent.com/polyhobbyist/babylon_ros/main/test/testdata/motoman.urdf",
    //         undefined,
    //         scene,
    //     ).then(result => result.meshes[0]);
    //     return scene;
    // }
}