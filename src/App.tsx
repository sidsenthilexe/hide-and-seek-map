import { useEffect, useRef, useState } from "react";
import MapView from "./MapView";
import Settings from "./Settings";
import Sidebar from "./Sidebar";

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scaleUnit, setScaleUnit] = useState<"metric" | "imperial">("imperial");
  const [hasPlayingArea, setHasPlayingArea] = useState(false);

  const MIN_WIDTH = 220;
  const MAX_WIDTH = 520;
  const COLLAPSED_WIDTH = 56;

  const[sidebarWidth, setSidebarWidth] = useState(320);
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e: PointerEvent) =>{
      if (!draggingRef.current) return;
      const raw = e.clientX;
      if (raw < MIN_WIDTH) {
        setSidebarWidth(COLLAPSED_WIDTH);
        return;
      }
      const  next  = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH,e.clientX));
      setSidebarWidth(next);
    };

    const onUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div style={{width:"100vw", height: "100vh", display:"flex"}}>
      <Sidebar
        width={sidebarWidth}
        hasPlayingArea  ={hasPlayingArea}
        onCreatePlayingArea={() => setHasPlayingArea(true)}
      />

      <div
        onPointerDown = {() => {
          draggingRef.current = true;
        }}
        style = {{
          width: 8,
          cursor: "col-resize",
          background: "transparent",
        }}
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