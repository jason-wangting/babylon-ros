
import { parseString } from 'xml2js';
import * as Util from './util';
import { IMaterial } from './objects/Material';
import { Visual } from './objects/Visual';
import { GeometryCylinder } from './geometry/GeometryCylinder';
import { GeometryBox } from './geometry/GeometryBox';
import { Vector3 } from '@babylonjs/core';
import { GeometrySphere } from './geometry/GeometrySphere';
import { Link } from './objects/Link';
import { Joint, JointType } from './objects/Joint';
import { Robot } from './objects/Robot';
import { GeometryMesh } from './geometry/GeometryMesh';
export async function parseUrdf(urdf: string): Promise<any> {
    return await new Promise((resolve, reject) => parseString(urdf, (err, jsonData) => {
        if (err) {
            reject(err);
        }
        resolve(jsonData);
    }));
}

/**
 * refer to https://wiki.ros.org/urdf/XML/link
 * <link> <visual> <material>
 * @param materialObject 
 * @param robot 
 * @returns 
 */
export function deserializeMaterial(materialObject: any, robot: Robot): IMaterial {
    const m = new IMaterial(robot);
    m.name = materialObject.$?.name;
    if (materialObject.color?.[0]?.$?.rgba) {
        m.color = Util.parseColor(materialObject.color[0].$.rgba);
    }
    if (materialObject.texture?.[0]?.$?.filename) {
        m.filename = materialObject.texture[0].$.filename;
    }
    return m;
}

/**
 * refer to https://wiki.ros.org/urdf/XML/link
 * <robot> <link> <visual>
 * @param visualObject 
 * @param robot 
 * @returns 
 */
export async function deserializeVisual(visualObject: any, robot: Robot): Promise<Visual> {
    const visual = new Visual(robot);

    // name attribute is optional in <visual> element
    visual.name = visualObject.$?.name;

    // The reference frame of the visual element with respect to the reference frame of the link.
    if (visualObject.origin?.[0]?.$?.xyz) {
        visual.origin = Util.parseVector(visualObject?.origin[0].$.xyz);
    }
    if (visualObject.origin?.[0]?.$?.rpy) {
        visual.rpy = Util.parseRPY(visualObject.origin[0].$.rpy);
    }

    // the material of the visual element
    // <robot> <link> <visual> <material>
    if (visualObject.material?.[0]) {
        visual.material = deserializeMaterial(visualObject.material[0], robot);
    }

    // <robot> <link> <visual> <geometry>
    if (!visualObject.geometry?.[0]) {
        throw new Error("Visual must have a geometry element.");
    }
    const geometryObject = visualObject.geometry[0];

    if (geometryObject.cylinder) {
        const cylinder = geometryObject.cylinder[0];
        visual.geometry = new GeometryCylinder(robot, cylinder.$?.length || 0, cylinder.$?.radius || 0);
    } else if (geometryObject.box) {
        const box = geometryObject.box[0];
        const size = Util.parseVector(box.$.size);
        visual.geometry = new GeometryBox(robot, size.x, size.y, size.z);
    } else if (geometryObject.sphere) {
        const sphere = geometryObject.sphere[0];
        visual.geometry = new GeometrySphere(robot, sphere.$?.radius || 1.0);
    } else if (geometryObject.mesh) {
        const mesh = geometryObject.mesh[0];
        let scale = new Vector3(1, 1, 1);
        if (mesh.$?.scale) {
            scale = Util.parseVector(geometryObject.$.scale);
        }
        visual.geometry = new GeometryMesh(robot, mesh.$?.filename, scale);
    } else {
        throw new Error("Visual geometry must have one of below: Cylinder, Box, Sphere, Mesh");
    }

    return visual;
}

/**
 * refer to https://wiki.ros.org/urdf/XML/link
 * <robot> <link>
 * @param linkObject 
 * @param robot 
 * @returns 
 */
export async function deserializeLink(linkObject: any, robot: Robot): Promise<Link> {
    const link = new Link(robot);
    link.name = linkObject.$.name;

    if (!link.name) {
        throw new Error("Links must have a name.");
    }

    // <robot> <link> <visual>
    // multiple instances of <visual> tags can exist for the same link. 
    // The union of the geometry they define forms the visual representation of the link.
    if (Array.isArray(linkObject.visual)) {
        for (const visualIndex in linkObject.visual) {
            const visual = linkObject.visual[visualIndex];
            const v = await deserializeVisual(visual, robot);
            if (!v.name) {
                v.name = `${link.name} visual`;
            }

            link.visuals.push(v);
        }
    }

    // for now, ignore the <inertail> and <collision> elements
    return link;
}

/**
 * refer to https://wiki.ros.org/urdf/XML/joint
 * <robot> <joint>
 * @param jointObject 
 * @param robot 
 * @returns 
 */
export async function deserializeJoint(jointObject: any, robot: Robot): Promise<Joint> {
    const joint = new Joint(robot);

    joint.name = jointObject.$?.name;
    if (!joint.name) {
        throw new Error("Joint must have a name.");
    }

    // Joint element mush have type attribute
    joint.type = jointObject.$?.type as JointType;
    // type mush be one of the following.
    if (![JointType.Revolute, JointType.Continuous, JointType.Prismatic, JointType.Fixed, JointType.Floating, JointType.Planar].includes(joint.type)) {
        throw new Error(`Joint ${joint.name} has an unknown type.`);
    }

    // if type is revolute or prismatic, <limit> element is required.
    if (
        (joint.type === JointType.Prismatic || joint.type === JointType.Revolute) &&
        !jointObject.limit?.[0]
    ) {
        throw new Error(`a Prismatic or Revolute Joint ${jointObject.$?.name} must <limit> element.`);
    }
    // <robot> <joint> <limit>
    if (jointObject.limit?.[0]) {
        const limit = jointObject.limit[0];
        const limitAttributes = limit.$;
        if (!limitAttributes?.effort || !limitAttributes?.velocity) {
            throw new Error('a <limit> element mush have effor and velocity attributes.');
        }
        if (limitAttributes?.lower) {
            joint.lowerLimit = parseFloat(limitAttributes.lower);
        }
        if (limitAttributes?.upper) {
            joint.upperLimit = parseFloat(limitAttributes.upper);
        }
    }

    // <robot> <joint> <parent>
    if (jointObject.parent?.[0]?.$?.link) {
        joint.parentName = jointObject.parent[0].$.link;
    } else {
        throw new Error(`Joint ${jointObject.$?.name} must have a parent.`);
    }

    // <robot> <joint> <child>
    if (jointObject.child?.[0]?.$?.link) {
        joint.childName = jointObject.child[0].$.link;
    } else {
        throw new Error(`Joint ${joint.name} must have a child.`);
    }

    // <robot> <joint> <origin>
    if (jointObject.origin?.[0]?.$) {
        const originAttributes = jointObject.origin[0].$;
        if (originAttributes.xyz) {
            joint.origin = Util.parseVector(originAttributes.xyz);
        }
        if (originAttributes.rpy) {
            joint.rpy = Util.parseRPY(originAttributes.rpy);
        }
    }

    return joint;
}

/**
 * refer to https://wiki.ros.org/urdf/XML/robot
 * @param urdfString 
 * @param robot 
 * @returns 
 */
export async function deserializeUrdfToRobot(urdfString: string, robot: Robot): Promise<Robot> {
    const urdf = await parseUrdf(urdfString);

    // The root element in a robot description file must be a robot, with all other elements must be encapsulated within.
    if (!urdf.robot) {
        throw new Error("");
    }

    robot.name = urdf.robot.$.name;
    if (!robot.name) {
        throw new Error("Robot element must have a name attribute.");
    }

    // material can be placed in root， and refered by name in the link visual
    if (Array.isArray(urdf.robot.material)) {
        for (const material of urdf.robot.material) {
            const m = deserializeMaterial(material, robot);
            robot.materialMap.set(m.name, m);
        }
    }

    // <robot> <link>
    if (Array.isArray(urdf.robot.link)) {
        for (const link of urdf.robot.link) {
            const l = await deserializeLink(link, robot);
            if (robot.linkMap.has(l.name)) {
                throw new Error(`Robot already has ${l.name} please use another name for the second link.`);
            } else {
                robot.linkMap.set(l.name, l);
            }
        }
    }

    // <robot> <joint>
    if (urdf.robot.joint instanceof Array) {
        for (let joint of urdf.robot.joint) {
            let j = await deserializeJoint(joint, robot);
            if (robot.jointMap.has(j.name)) {
                throw new Error(`Robot already has ${j.name} please use another name for the second joint.`);
            } else {
                robot.jointMap.set(j.name, j);
            }

            const parentLink = robot.linkMap.get(j.parentName);
            if (parentLink) {
                j.parent = parentLink;
            } else {
                throw new Error(`Joint ${j.name} has refered to a link ${j.parentName} which could not be found.`);
            }

            const childLink = robot.linkMap.get(j.childName);
            if (childLink) {
                j.child = childLink;
            } else {
                throw new Error(`Joint ${j.name} has refered to a link ${j.childName} which could not be found.`);
            }
        }
    }

    return robot;
}


