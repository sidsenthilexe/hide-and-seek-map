import { useState } from "react";
import MapView from "./MapView";
import Settings from "./Settings";
import Sidebar from "./Sidebar";
import type {MapInteractionMode, MapPoint, PlayingAreaMode, RadarQuestion, RadarResult, QuestionFlow} from "./Types";

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
  const [questionFlow, setQuestionFlow] = useState<QuestionFlow>({kind: "closed"});
  const [radarQuestions, setRadarQuestions] = useState<RadarQuestion[]>([]);

  const startDrawingArea = () => {
    setMode("drawing");
    setDrawingPoints([]);
    setPlayingArea(null);
    setRadarQuestions([]);
    setQuestionFlow({kind: "closed"});
  };

  const cancelDrawingArea = () => {
    setMode("idle");
    setDrawingPoints([]);
    setQuestionFlow({kind: "closed"})
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

  const openQuestionMenu = () => {
    setQuestionFlow({kind: "menu"});
  }

  function formatRadarRadiusText(radiusKm: number, scaleUnit: "metric" | "imperial") {
    const radiusValue = scaleUnit === "imperial" ? radiusKm/1.609344 : radiusKm;
    return String(Number(radiusValue.toFixed(2)));
  }

  const radarQuestion = () => {
    setQuestionFlow({
      kind: "radar",
      draft: {
        radiusText: "1",
        result: "out",
        centerPoint: null,
        isPickingCenter: false,
        editingRadarId: null,
      },
    });
  };

  const editRadarQuestion = (radarQuestionId: string) => {
    const radarQuestion = radarQuestions.find((question) => question.id === radarQuestionId);
    if (!radarQuestion) return;

    setQuestionFlow({
      kind: "radar",
      draft: {
        radiusText: formatRadarRadiusText(radarQuestion.radiusKm, scaleUnit),
        result: radarQuestion.result,
        centerPoint: radarQuestion.centerPoint,
        isPickingCenter: false,
        editingRadarId: radarQuestion.id,
      },
    });
  };

  const updateRadar = (updates: Partial<{
    radiusText: string;
    result: RadarResult;
    centerPoint: MapPoint | null;
    isPickingCenter: boolean;
  }>) => {
      if (questionFlow.kind !== "radar") return;

      const nextRadiusText = updates.radiusText !== undefined ? updates.radiusText : questionFlow.draft.radiusText;
      const nextResult = updates.result !== undefined ? updates.result : questionFlow.draft.result;
      const nextCenterPoint = updates.centerPoint !== undefined ? updates.centerPoint : questionFlow.draft.centerPoint;
      const radiusValue = Number(nextRadiusText);
      
      const previewId = questionFlow.draft.editingRadarId ?? "draft-radar";

      if (!Number.isFinite  || radiusValue <= 0 || !nextCenterPoint) {
        setRadarQuestions((current) => current.filter((q) => q.id != previewId));
      } else {
        const radiusKm  = scaleUnit==="imperial" ? radiusValue *1.60934 : radiusValue;
        setRadarQuestions((current) => {
          const exists = current.some(q => q.id === previewId);
          const updatedQuestion: RadarQuestion = {
            id: previewId,
            centerPoint: nextCenterPoint,
            radiusKm,
            result: nextResult,
          };

          if (exists) { return current.map((q) => q.id === previewId ? updatedQuestion : q); }
          else { return [...current, updatedQuestion] }
        });
        
      }

      setQuestionFlow((current) => {
        if (current.kind !== "radar") return current;
        return {
          kind: "radar",
          draft: {
            ...current.draft,
            ...updates,
          },
        };
      });

    };

  const  commitRadarQuestion = (centerPoint:  MapPoint) => {
    if (questionFlow.kind !== "radar") return;

    const radiusValue = Number(questionFlow.draft.radiusText);
    if (!Number.isFinite(radiusValue) || radiusValue <= 0) return;

    const radiusKm = scaleUnit==="imperial"? radiusValue * 1.609344 : radiusValue;
    const nextQuestion: RadarQuestion = {
      id: questionFlow.draft.editingRadarId ?? String(Date.now()) + String(Math.random()),
      centerPoint,
      radiusKm,
      result: questionFlow.draft.result,
    };

    setRadarQuestions((current) => questionFlow.draft.editingRadarId
      ? current.map((question) => question.id === questionFlow.draft.editingRadarId ? nextQuestion: question)
      : [...current, nextQuestion]);

    setQuestionFlow({kind: "closed"});
  }

  

  const pickRadarCenter = () => {
    setQuestionFlow((current) => {
      if (current.kind !== "radar") return current;
      return {
        kind: "radar",
        draft: {
          ...current.draft,
          isPickingCenter: true,
        },
      };
    });
  };

  const saveRadarQuestion = () => {
    if (questionFlow.kind !== "radar") return;
    const radiusValue = Number(questionFlow.draft.radiusText);
    if (!Number.isFinite(radiusValue) || radiusValue <= 0) return;
    if (!questionFlow.draft.centerPoint) return;

    const radiusKm = scaleUnit==="imperial" ? radiusValue * 1.60934 : radiusValue;
    const finalId = questionFlow.draft.editingRadarId ?? String(Date.now()) + String(Math.random());

    const nextQuestion: RadarQuestion = {
      id: finalId,
      centerPoint: questionFlow.draft.centerPoint,
      radiusKm: radiusKm,
      result: questionFlow.draft.result,
    };

    setRadarQuestions((current) => {
      if (questionFlow.draft.editingRadarId) {
        return current.map((q) => q.id === finalId ? nextQuestion : q);
      }
      return current.map((q) => q.id === "draft-radar" ? nextQuestion : q);
    });
    setQuestionFlow({kind: "closed"});
  };

  const cancelQuestionFlow = () => {
    if (questionFlow.kind === "radar" && !questionFlow.draft.editingRadarId) {
      setRadarQuestions((current) => current.filter((q) => q.id !== "draft-radar"));
    }
    setQuestionFlow({kind: "closed"});
  }

  const handleMapClick = (point:MapPoint) => {
    if (mapMode === "drawing") {
      if (wouldCreateIntersection(drawingPoints, point)) return;
      setDrawingPoints((current) => [...current, point]);
      return;
    }

    if (mapMode === "radar-picking-center") {
      updateRadar({centerPoint: point, isPickingCenter: false})
    }
};

  const handleFirstPointClick = () => {
    if (drawingPoints.length >= 3) {
      finishDrawingArea();
    }
  }

  const mapMode: MapInteractionMode =
    mode === "drawing" ? "drawing"
      : questionFlow.kind === "radar" ? "radar-picking-center"
      : "idle";

  return (
    <div style={{width: "100vw", height: "100vh", display: "flex"}}>
      <Sidebar
        width={320}
        mode={mode}
        hasPlayingArea={playingArea !== null}
        pointsCount={drawingPoints.length}
        questionFlow={questionFlow}
        scaleUnit = {scaleUnit}
        radarQuestions = {radarQuestions}
        onCreatePlayingArea={startDrawingArea}
        onFinishPlayingArea={finishDrawingArea}
        onCancelPlayingArea={cancelDrawingArea}
        onOpenQuestionMenu={openQuestionMenu}
        onStartRadarQuestion={radarQuestion}
        onEditRadarQuestion={editRadarQuestion}
        onUpdateRadarDraft={updateRadar}
        onPickRadarCenter={pickRadarCenter}
        onSaveRadarQuestion={saveRadarQuestion}
        onCancelQuestionFlow={cancelQuestionFlow}
      />

      <div style={{position: "relative", flex: 1, height: "100%"}}>
        <MapView
          scaleUnit={scaleUnit}
          mode={mapMode}
          drawingPoints={drawingPoints}
          playingArea={playingArea}
          radarQuestions={radarQuestions}
          onMapClick={handleMapClick}
          onFirstPointClick={handleFirstPointClick}
        />

      <button
        onClick={() => setIsSettingsOpen(true)}
        className = "sidebar-button"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 16,
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