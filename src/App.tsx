import { useState } from "react";
import MapView from "./MapView";
import Settings from "./Settings";
import Sidebar from "./Sidebar";

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scaleUnit, setScaleUnit] = useState<"metric" | "imperial">("imperial");
  const [hasPlayingArea, setHasPlayingArea] = useState(false);

  return (
    <div style={{width:"100vw", height: "100vh", display:"flex"}}>
      <Sidebar
        hasPlayingArea  ={hasPlayingArea}
        onCreatePlayingArea={() => setHasPlayingArea(true)}
      />

      <div style  = {{position:"relative",flex:1, height: "100%"}}>
      <MapView scaleUnit={scaleUnit} />

      <button
        onClick={() => setIsSettingsOpen(true)}
        style ={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 16,
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid #ccc",
          background: "black",
          cursor: "pointer",
        }}
      >Settings</button>

      <Settings
        isOpen={isSettingsOpen}
        scaleUnit={scaleUnit}
        onChangeScaleUnit={setScaleUnit}
        onClose={() => setIsSettingsOpen(false)}
      />
      </div>
    </div>
  );
}