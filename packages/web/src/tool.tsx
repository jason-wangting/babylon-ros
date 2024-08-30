import { editor } from "./editor"

const URDFTestList = [
    { name: "Basic", url: "/test-data/urdf/basic.urdf" },
    { name: "joint", url: "/test-data/urdf/basic_with_joint.urdf" },
    { name: "material", url: "/test-data/urdf/basic_with_material.urdf" },
    { name: "remote-mesh", url: "/test-data/urdf/basic_with_remote_mesh.urdf" },
    { name: "stl-mesh", url: "/test-data/urdf/basic_with_stl_mesh.urdf" }
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