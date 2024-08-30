import { Vector3, Color4, TransformNode } from "@babylonjs/core";

export function parseVector(vec: string) : Vector3 {
  vec = vec.trim();
  var xyz = vec.split(' ');
  if (xyz.length != 3) {
    throw new Error("Vector ${vec} does not have 3 values")
  }

  return new Vector3(parseFloat(xyz[0]), parseFloat(xyz[1]), parseFloat(xyz[2]));
}

export function parseRPY(rpy: string) : Vector3 {
  let v = parseVector(rpy);

  // ROS is Roll, Pitch, Yaw - BABYLON Vector is Pitch, Yaw, Roll
  return new Vector3(v.x, v.y, v.z);
}

export function parseColor(color: string) : Color4 {
  color = color.trim();
  var rgba = color.split(' ');
  if (rgba.length != 4) {
    throw new Error("Color ${rgba} does not have 4 values")
  }

  return new Color4(parseFloat(rgba[0]), parseFloat(rgba[1]), parseFloat(rgba[2]), parseFloat(rgba[3]));
}

export function applyRotationToTransform(transformNode : TransformNode, vec: Vector3) {
  transformNode.addRotation(0, 0, vec.z).addRotation(0, vec.y, 0).addRotation(vec.x, 0, 0);
}
