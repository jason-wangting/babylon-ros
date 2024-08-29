import { URDFLink } from "../interfaces/URDF";
import Link from "../objects/link";
import convertUrdfVisualToVisual from "./convert-urdf-visual-to-visual";

export default async function convertUrdfLinkToLink(urdfLink: URDFLink): Promise<Link> {
    const link = new Link();
    link.name = urdfLink.$.name;
    if (urdfLink.visual?.length > 0) {
        for (let urdfVisual of urdfLink.visual) {
            const visual = await convertUrdfVisualToVisual(urdfVisual);
            visual.name = `${link.name}.visual.${link.visuals.length}`;
            link.visuals.push(visual);

        }
    }
    return link;
}