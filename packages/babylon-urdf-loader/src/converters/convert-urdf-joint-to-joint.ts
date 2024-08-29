import { URDFJoint } from "../interfaces/URDF";
import Joint from "../objects/joint";

export default function convertUrdfJointToJoint(urdfJoint: URDFJoint): Joint {
    const joint = new Joint();
    joint.name = urdfJoint.$.name;
    joint.type = urdfJoint.$.type;
    joint.parentLinkName = urdfJoint.parent[0].$.link;
    joint.childLinkName = urdfJoint.child[0].$.link;
    return joint;
}