import Robot from "../objects/robot";
import { parseUrdf } from "../util";
import convertUrdfJointToJoint from "./convert-urdf-joint-to-joint";
import convertUrdfLinkToLink from "./convert-urdf-link-to-link";


export default async function convertUrdfTextToRobot(urdfText: string): Promise<Robot> {
    const robot = new Robot();
    console.log({urdfText});
    const urdf = await parseUrdf(urdfText);
    console.log({urdf});
    
    // name of the robot
    robot.name = urdf.robot.$?.name || '';

    if (urdf.robot.link instanceof Array) {
        for (let urdfLink of urdf.robot.link) {
            const link = await convertUrdfLinkToLink(urdfLink);
            robot.links.set(link.name, link);
        }
    }
    if (urdf.robot.joint instanceof Array) {
        for (let urdfJoint of urdf.robot.joint) {
            const joint = convertUrdfJointToJoint(urdfJoint);
            joint.parent = robot.links.get(joint.parentLinkName);
            joint.child = robot.links.get(joint.childLinkName);
            robot.joints.set(joint.name, joint);
        }
    }
    return robot;
}