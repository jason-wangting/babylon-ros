import './App.css'
import { useEffect } from 'react'
import { editor } from './editor';
import ToolBar from './tool';

function App() {
  useEffect(() => {
    editor.init();
    return () => {
      editor.dispose();
    }
  }, []);
  return (
    <div style={{ height: "100%", width: "100%", overflow: 'hidden' }}>
      <ToolBar />
      <div style={{ height: "calc(100% - 60px)", width: "100%" }}>
        <canvas id="preview-canvas" />
      </div>
    </div>
  )
}

export default App
