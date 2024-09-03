import { SceneLoader } from "@babylonjs/core";
import Editor from "./editor";
import { URDFLoader } from "babylon-urdf-loader";
import { getBaseAndFileName } from "./util";
import { DAEFileLoader } from "babylon-dae-loader";


export default class Loader {
    constructor(public editor: Editor) {}
    init() {
        // support load urdf file
        SceneLoader.RegisterPlugin(new URDFLoader());
        // support load dae file(urdf mesh reference collada sometimes)
        SceneLoader.RegisterPlugin(new DAEFileLoader());
    }
    /**
     * Load URDF file from URL
     * @param url 
     */
    async loadURDFViaURL(url: string) {
        const { base, filename } = getBaseAndFileName(url);
        SceneLoader.ImportMesh(null, base, filename, this.editor.scene, result => {
            console.log("ImportMesh", result);
        });
    }
}