import { editor } from "./editor"

const URDFTestList = [
    { name: "joint", url: "/test-data/urdf/basic_with_joint.urdf" },
    { name: "material", url: "/test-data/urdf/basic_with_material.urdf" },
    { name: "remote-mesh", url: "/test-data/urdf/basic_with_remote_mesh.urdf" },
    { name: "stl-mesh", url: "/test-data/urdf/basic_with_stl_mesh.urdf" },
    { name: "bb", url: "/test-data/urdf/bb.urdf" },
    { name: "leo", url: "/test-data/urdf/leo.urdf" },
    { name: "motoman", url: "/test-data/urdf/motoman.urdf" },
    { name: "orientation", url: "/test-data/urdf/orientation.urdf" },
    { name: "r2", url: "/test-data/urdf/r2.urdf" },
    { name: "aubo-i5", url: "/test-data/urdf/aubo-i5/aubo_i5.urdf" },
    { name: "ur5", url: "/test-data/urdf/ur5/ur5.urdf" },
]
export default function ToolBar() {
    console.log("ToolBar");
    const loadURDFViaUrl = (url: string) => {
        editor.loader.loadURDFViaURL(url);
    }
    return (
        <div style={{display: "flex", gap: "10px", height: "60px", alignItems: "center"}}>
            <button>Load URDF</button>
            {
                URDFTestList.map(({name, url}) => {
                    return <button key={name} onClick={() => loadURDFViaUrl(url)}>Load URDF({name})</button>
                })
            }
            <button>Load DAE</button>
            
        </div>
    )
}