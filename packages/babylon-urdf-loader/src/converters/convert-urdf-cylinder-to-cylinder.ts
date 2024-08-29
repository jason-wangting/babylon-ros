import { URDFCylinder } from "../interfaces/URDF";
import { GeometryCylinder } from "../geometry/geometry-cylinder";

export default function convertUrdfCylinderToCylinder(urdfCylinder: URDFCylinder): GeometryCylinder {
    const cylinder = new GeometryCylinder(urdfCylinder.$.radius, urdfCylinder.$.length);
    return cylinder;
}