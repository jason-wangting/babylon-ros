import { SceneLoader } from "@babylonjs/core";
import Editor from "./editor";
import { URDFLoader } from "babylon-urdf-loader";
import { getBaseAndFileName } from "./util";


export default class Loader {
    constructor(public editor: Editor) {}
    init() {
        SceneLoader.RegisterPlugin(new URDFLoader());
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