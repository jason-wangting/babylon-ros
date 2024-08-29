export interface URDF {
    robot: {
        $: URDFItemProps;
        link: URDFLink[];
        joint: URDFJoint[];
    }
}
export interface URDFLink {
    $: URDFItemProps;
    visual: URDFVisual[];
}
export interface URDFVisual {
    geometry: URDFGeometry[];
}
export interface URDFGeometry {
    cylinder?: URDFCylinder[];
    box?: URDFBox[];
    sphere?: URDFSphere[];
    mesh?: URDFMesh[];
}
export interface URDFCylinder {
    $: {
        length: number;
        radius: number;
    }
}
export interface URDFMesh {
    $: {
        scale: string;
        filename: string;
    }
}
export interface URDFBox {
    $: {
        size: string;
    }
}
export interface URDFSphere {
    $: {
        radius: number;
    }
}
export interface URDFItemProps {
    name: string;
}
export enum JointType {
    Fixed = "fixed",
    Revolute = "revolute",
    Continuous = "continuous",
    Prismatic = "prismatic",
    Floating = "floating",
    Planar = "planar"
};

export interface URDFJoint {
    $: {
        type: JointType;
    } & URDFItemProps;
    parent: {
        $: {
            link: string;
        }
    }[];
    child: {
        $: {
            link: string;
        }
    }[];
    origin: {
        $: {
            xyz: string;
        }
    }[];
}