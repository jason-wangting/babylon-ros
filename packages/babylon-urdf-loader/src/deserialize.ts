
import { parseString } from 'xml2js';
import * as Util from './util';
import { IMaterial } from './objects/Material';
import { Visual } from './objects/Visual';
import { Cylinder } from './geometry/GeometryCylinder';
import { Box } from './geometry/GeometryBox';
import { Vector3 } from '@babylonjs/core';
import { Sphere } from './geometry/GeometrySphere';
import { Link } from './objects/Link';
import { Joint, JointType } from './objects/Joint';
import { Robot } from './objects/Robot';
import { GeometryMesh } from './geometry/GeometryMesh';
export async function parseUrdf(urdf: string) : Promise<any> {
    return await new Promise((resolve, reject) => parseString(urdf, (err, jsonData) => {
        if (err) {
        reject(err);
        }
        resolve(jsonData);
    }));
}

export function deserializeMaterial(materialNode: any) : IMaterial {
    let m = new IMaterial();
    m.name = materialNode.$?.name;
    if (materialNode.color?.length == 1 && materialNode.color[0].$?.rgba) {
        let color = Util.parseColor(materialNode.color[0].$.rgba);
        m.color = color
        return m;
    } else if (materialNode.color?.length > 1) {
        throw new Error(`Material ${materialNode.$?.name} has multiple color values; should only have 1.`);
    }

    if (materialNode.texture?.length == 1 && materialNode.texture[0].$?.filename) {
        m.filename = materialNode.texture[0].$.filename;
    } else if (materialNode.texture?.length > 1) {
        throw new Error(`Material ${materialNode.$?.name} has multiple texture values; should only have 1.`);
    } 
    
    return m;
}

export async function deserializeVisual(visualObject: any) : Promise<Visual> {
    const visual = new Visual();

    if (visualObject.origin && visualObject.origin.length == 1) {
      if (visualObject.origin[0].$.xyz) {
        visual.origin = Util.parseVector(visualObject?.origin[0].$.xyz);
      }
      if (visualObject.origin[0].$.rpy) {
        visual.rpy = Util.parseRPY(visualObject.origin[0].$.rpy);
      }
    }

    if (visualObject.material?.length == 1) {
      visual.material = deserializeMaterial(visualObject.material[0]);
    } else if (visualObject.material?.length > 1) {
        throw new Error("Visual has multiple materials; must only have 1.");
    } 

    if (visualObject.geometry[0]?.cylinder && visualObject.geometry[0]?.cylinder.length == 1) {
      visual.geometry = new Cylinder(visualObject.geometry[0].cylinder[0].$?.length || 0, visualObject.geometry[0].cylinder[0].$?.radius || 0);
      } else if  (visualObject.geometry[0]?.box && visualObject.geometry[0]?.box.length == 1) {
        let size = Util.parseVector(visualObject.geometry[0].box[0].$.size);
        visual.geometry = new Box(size.x, size.y, size.z);
      } else if (visualObject.geometry[0]?.mesh != null) {
        let s = new Vector3(1, 1, 1);
        if (visualObject.geometry[0].mesh[0].$?.scale) {
          s = Util.parseVector(visualObject.geometry[0].mesh[0].$.scale);
        }
        visual.geometry = new GeometryMesh(visualObject.geometry[0].mesh[0].$?.filename, s);
      } else if (visualObject.geometry[0]?.sphere != null) {
        visual.geometry = new Sphere(visualObject.geometry[0].sphere[0].$?.radius || 1.0);
    }

    return visual;
}

export async function deserializeLink(linkObject: any) : Promise<Link> {
    let link = new Link();
    if (linkObject.$?.name) {
      link.name = linkObject.$.name;
    } else {
      throw new Error("Links must have a name.");
    }

    if (linkObject.material?.length == 1) {
        throw new Error(`Link ${link.name} has a material; Did you mean to put it on visual?`);
    } 

    if (linkObject.visual?.length > 0) {
      for (let visual of linkObject.visual) {
        let v = await deserializeVisual(visual);
        v.name = link.name;
        link.visuals.push(v);
      }
    }
    return link;
}

export async function deserializeJoint(jointObject: any) : Promise<Joint> {
    let joint = new Joint();
    if (jointObject.$?.name) {
      joint.name = jointObject.$.name;
    } else {
      throw new Error("Links must have a name.");
    }
    
    if (jointObject.$?.type) {
      try {
      joint.type = jointObject.$.type as JointType;
      } catch {
        throw new Error(`Link ${joint.name} has an unknown type.`);
      }
    } else {
      throw new Error(`Link ${joint.name} must have a type.`);
    }

    if (jointObject.limit?.length == 1) {
        joint.lowerLimit = parseFloat(jointObject.limit[0].$?.lower);
        joint.upperLimit = parseFloat(jointObject.limit[0].$?.upper);
    } 
    
    if ((joint.type == JointType.Prismatic ||
        joint.type == JointType.Revolute) &&
        (jointObject.limit?.length == 0 ||
          jointObject.limit[0].$.effort == undefined ||
          jointObject.limit[0].$.velocity == undefined)) {
      throw new Error(`a Prismatic or Revolute Joint ${jointObject.$?.name} must specify effort and velocity.`);
    }

    if (jointObject.parent == undefined || jointObject.parent.length == 0) {
      throw new Error(`Joint ${jointObject.$?.name} must have a parent.`);
    } else if (jointObject.parent.length == 1) {
        joint.parentName = jointObject.parent[0].$.link;
    } else {
        throw new Error(`Joint ${jointObject.$?.name} has multiple parents, and requires only a single.`);
    }

    if (jointObject.child == undefined || jointObject.child.length == 0) {
      throw new Error(`Joint ${jointObject.$?.name} must have a child.`);
    } else if (jointObject.child.length == 1) {
        joint.childName = jointObject.child[0].$.link;
    } else {
        throw new Error(`Joint ${jointObject.$?.name} has multiple children, and requires only a single.`);
    }

    if (jointObject.origin && jointObject.origin.length == 1) {
      if (jointObject.origin[0].$.xyz) {
        joint.origin = Util.parseVector(jointObject.origin[0].$.xyz);
      }
      if (jointObject.origin[0].$.rpy) {
        joint.rpy = Util.parseRPY(jointObject.origin[0].$.rpy);
      }
    }

    return joint;
}

export async function deserializeUrdfToRobot(urdfString: string) : Promise<Robot> {
    let urdf = await parseUrdf(urdfString);

    let robot = new Robot();
    console.log({urdf});
    robot.name = urdf.robot.$?.name;

    if (urdf.robot.material instanceof Array) {
      for (let material of urdf.robot.material) {
        let m = await deserializeMaterial(material);
        robot.materials.set(m.name, m);
      }
    }

    if (urdf.robot.link instanceof Array) {
      for (let link of urdf.robot.link) {
        let l = await deserializeLink(link);
        if (robot.links.has(l.name)) {
          throw new Error(`Robot already has ${l.name} please use another name for the second link.`);
        } else {
          robot.links.set(l.name, l);
        }
      }
    }

    if (urdf.robot.joint instanceof Array) {
      for (let joint of urdf.robot.joint) {
        let j = await deserializeJoint(joint);
        robot.joints.set(j.name, j);

        let p = robot.links.get(j.parentName);
        if (p) {
          j.parent = p;
        } else {
          throw new Error(`Joint ${j.name} has refered to a link ${j.parentName} which could not be found.`);
        }

        let c = robot.links.get(j.childName);
        if (c) {
          j.child = c;
        } else {
          throw new Error(`Joint ${j.name} has refered to a link ${j.childName} which could not be found.`);
        }
      }
    }

    return robot;
}


