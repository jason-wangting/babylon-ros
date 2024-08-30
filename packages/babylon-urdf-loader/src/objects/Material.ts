import { Color4, Scene, StandardMaterial, Texture, Color3, Material } from "@babylonjs/core";
import { Robot } from "./Robot";

export class IMaterial {
    public name: string = "default";
    public filename: string = "";
    public color?: Color4;
    public material?: Material;

    constructor( private robot: Robot ) {}

    public isReference(): boolean {
        return this.filename === "" && this.color == undefined;
    }

    public create(): void {
        if (this.filename) {
            const c = new StandardMaterial(this.name, this.robot.scene);
            c.diffuseTexture = new Texture(this.filename);
            c.diffuseTexture.hasAlpha = true;
        } else {
            const m = new StandardMaterial(this.name, this.robot.scene);

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