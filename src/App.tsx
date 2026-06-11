import { useEffect, useRef, useState } from "react";
import MapView from "./MapView";
import Settings from "./Settings";
import Sidebar from "./Sidebar";

type MapPoint = [number, number];
type PlayingAreaMode ="idle" | "drawing" | "set";

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scaleUnit, setScaleUnit] = useState<"metric" | "imperial">("imperial");

  const [mode, setMode] = useState<PlayingAreaMode>("idle");
  const [drawingPoints, setDrawingPoints] = useState<MapPoint[]>([]);
  const [playingArea, setPlayingArea] = useState<GeoJSON.Polygon | null>(null);

  const startDrawingArea = () => {
    setMode("drawing");
    setDrawingPoints([]);
    setPlayingArea(null);
  };

  const cancelDrawingArea = ()=> {
    setMode("idle");
    setDrawingPoints([]);
  }

  const finishDrawingArea = () => {
    if (drawingPoints.length < 3) return;
    const closedShape: MapPoint[] = [...drawingPoints, drawingPoints[0]];
    setPlayingArea({
      type: "Polygon",
      coordinates: [closedShape],
    });
    setMode("set");
  }

  const handleMapClick = (point:MapPoint) => {
    if(mode !== "drawing") return;
    setDrawingPoints((current) => [...current, point]);
  };

  return (
    <div style={{width: "100vw", height: "100vh", display: "flex"}}>
      <Sidebar
        width={320}
        mode={mode}
        hasPlayingArea={playingArea !== null}
        pointsCount={drawingPoints.length}
        onCreatePlayingArea={startDrawingArea}
        onFinishPlayingArea={finishDrawingArea}
        onCancelPlayingArea={cancelDrawingArea}
      />

      <div style={{position: "relative", flex: 1, height: "100%"}}>
        <MapView
          scaleUnit={scaleUnit}
          mode={mode}
          drawingPoints={drawingPoints}
          playingArea={playingArea}
          onMapClick={handleMapClick}
        />
      </div>
    </div>
  )

}