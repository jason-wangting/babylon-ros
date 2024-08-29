import { Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { IGeometry } from "../geometry/IGeometry";

export default class Visual {
    public name: string = "";
    public origin: Vector3 = new Vector3(0, 0, 0);
    public rpy: Vector3 = new Vector3(0, 0, 0);
    public geometry: IGeometry | undefined;
    public transform: TransformNode | undefined;
    public create(scene: Scene) {
        console.log('Visual Name:', this.name);

        this.transform = new TransformNode(this.name, scene);
        if (this.geometry !== undefined) {
            this.geometry.create(scene);
            if (this.transform !== undefined && this.geometry.transform !== undefined) {
                this.geometry.transform.parent = this.transform;
            }
        }
    }
}