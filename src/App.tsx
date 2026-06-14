import { useState } from "react";
import MapView from "./MapView";
import Settings from "./Settings";
import Sidebar from "./Sidebar";

type MapPoint = [number, number];
type PlayingAreaMode ="idle" | "drawing" | "set";

function pointsEqual(a: MapPoint, b: MapPoint) {
  return a[0] === b[0] && a[1] === b[1];
}

function orientation3(a: MapPoint, b: MapPoint, c: MapPoint) {
  const val = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) *  (c[1]-b[1]);
  if (val === 0) return 0;
  return val > 0 ? 1 : 2;
}

function onSegment(a: MapPoint, b: MapPoint, c: MapPoint) {
  return (
    Math.min(a[0], c[0]) <= b[0] &&
    b[0] <= Math.max(a[0], c[0]) &&
    Math.min(a[1], c[1]) <= b[1] &&
    b[1] <= Math.max(a[1], c[1])
  );
}

function segmentsIntersect(
  p1: MapPoint,
  q1: MapPoint,
  p2: MapPoint,
  q2: MapPoint
) {
  const o1 = orientation3(p1, q1, p2);
  const o2 = orientation3(p1, q1, q2);
  const o3 = orientation3(p2, q2, p1);
  const o4 = orientation3(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;

  return false;
}

function wouldCreateIntersection(points: MapPoint[], newPoint: MapPoint) {
  if (points.length < 2) return false;
  const lastPoint = points[points.length - 1];

  if (points.some((point) => pointsEqual(point, newPoint))) {
    return true;
  }

  for (let i = 0; i < points.length-2; i++) {
    const segmentStart = points[i];
    const segmentEnd = points[i + 1];

    if (segmentsIntersect(lastPoint, newPoint, segmentStart, segmentEnd)) {
      return true;
    }
  }
  return false;
}

function edgeCloseWouldIntersect(points: MapPoint[]) {
  if (points.length < 3) return false;
  const firstPoint = points[0];
  const lastPoint = points[points.length-1];
  for(let i = 1; i < points.length - 2; i++) {
    const segmentStart = points[i];
    const segmentEnd = points[i+1];
    if (segmentsIntersect(lastPoint, firstPoint, segmentStart, segmentEnd)) {
      return true;
    }
  }
  return false;
}

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

  const cancelDrawingArea = () => {
    setMode("idle");
    setDrawingPoints([]);
  }

  const finishDrawingArea = () => {
    if (drawingPoints.length < 3) return;
    if (edgeCloseWouldIntersect(drawingPoints)) return;
    const closedShape: MapPoint[] = [...drawingPoints, drawingPoints[0]];
    setPlayingArea({
      type: "Polygon",
      coordinates: [closedShape],
    });
    setDrawingPoints([]);
    setMode("set");
  }

  const handleMapClick = (point:MapPoint) => {
    if(mode !== "drawing") return;
    if (wouldCreateIntersection(drawingPoints, point)) return;
    setDrawingPoints((current) => [...current, point]);
  };

  const handleFirstPointClick = () => {
    if (drawingPoints.length >= 3) {
      finishDrawingArea();
    }
  }

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
          onFirstPointClick={handleFirstPointClick}
        />

      <button
        onClick={() => setIsSettingsOpen(true)}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 16,
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid lightgray",
          background: "black",
          color: "white",
          cursor: "pointer",
        }}
      >
        Settings
      </button>
      
      <Settings
        isOpen={isSettingsOpen}
        scaleUnit={scaleUnit}
        onChangeScaleUnit={setScaleUnit}
        onClose={() => setIsSettingsOpen(false)}
      />

      </div>
    </div>
  )

}