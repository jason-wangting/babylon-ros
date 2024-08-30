import { Color4, Scene, StandardMaterial, Texture, Color3, Material } from "@babylonjs/core";

export class IMaterial {
    public name: string = "default";
    public filename: string = "";
    public color?: Color4;
    public material?: Material;

    constructor() {
    }

    public isReference(): boolean {
        return this.filename === "" && this.color == undefined;
    }

    public create(scene: Scene): void {
        if (this.filename) {
            let c = new StandardMaterial(this.name, scene);
            c.diffuseTexture = new Texture(this.filename);
            c.diffuseTexture.hasAlpha = true;
        } else {
            let m = new StandardMaterial(this.name, scene);

            if (this.color == undefined) {
                this.color = new Color4(1, 1, 1, 1);
            }
            m.diffuseColor = new Color3(this.color.r, this.color.g, this.color.b);
            m.alpha = this.color.a;
            this.material = m;
        }
        if (this.material) {
            this.material.backFaceCulling = false;
        }
    }

    public dispose() {
        this.material?.dispose();
    }
}