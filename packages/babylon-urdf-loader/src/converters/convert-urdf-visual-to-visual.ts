import { URDFVisual } from "../interfaces/URDF";
import { GeometryBox } from "../geometry/geometry-box";
import Visual from "../objects/visual";
import { parseVector } from "../util";
import convertUrdfCylinderToCylinder from "./convert-urdf-cylinder-to-cylinder";
import GeometrySphere from "../geometry/geometry-sphere";
import { Vector3 } from "@babylonjs/core";
import GeometryMesh from "../geometry/geometry-mesh";

export default async function convertUrdfVisualToVisual(urdfVisual: URDFVisual): Promise<Visual> {
    const visual = new Visual();

    // when the geometry is a cylinder
    if (
        urdfVisual.geometry[0]?.cylinder &&
        urdfVisual.geometry[0].cylinder.length === 1
    ) {
        visual.geometry = convertUrdfCylinderToCylinder(urdfVisual.geometry[0].cylinder[0]);
    } else if (
        urdfVisual.geometry[0]?.box &&
        urdfVisual.geometry[0].box.length === 1
    ) {
        const size = parseVector(urdfVisual.geometry[0].box[0].$.size);
        visual.geometry = new GeometryBox(size.x, size.y, size.z);
    } else if (
        urdfVisual.geometry[0]?.sphere &&
        urdfVisual.geometry[0].sphere.length === 1
    ) {
        visual.geometry = new GeometrySphere(urdfVisual.geometry[0].sphere[0].$.radius);
    } else if (urdfVisual.geometry[0]?.mesh && urdfVisual.geometry[0].mesh.length === 1) {
        const vector = new Vector3(1, 1, 1);
        if (urdfVisual.geometry[0].mesh[0].$.scale) {
            vector.copyFrom(parseVector(urdfVisual.geometry[0].mesh[0].$.scale));
        }
        visual.geometry = new GeometryMesh(urdfVisual.geometry[0].mesh[0].$.filename, vector);
    }

    return visual;
}
