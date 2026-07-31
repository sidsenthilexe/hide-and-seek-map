import { useState } from "react";
import MapView from "./MapView";
import Settings from "./Settings";
import Sidebar from "./Sidebar";
import type { 
  LatitudeQuestion,
  LatitudeResult,
  LongitudeQuestion,
  LongitudeResult,
  MapInteractionMode, 
  MapPoint, 
  PlayingAreaMode, 
  RadarQuestion, 
  RadarResult,
  QuestionFlow } from "./Types";

function pointsEqual(a: MapPoint, b: MapPoint) {
  return a[0] === b[0] && a[1] === b[1];
}

function orientation3(a: MapPoint, b: MapPoint, c: MapPoint) {
  const val = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
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

  for (let i = 0; i < points.length - 2; i++) {
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
  const lastPoint = points[points.length - 1];
  for (let i = 1; i < points.length - 2; i++) {
    const segmentStart = points[i];
    const segmentEnd = points[i + 1];
    if (segmentsIntersect(lastPoint, firstPoint, segmentStart, segmentEnd)) {
      return true;
    }
  }
  return false;
}

function addOrUpdate<T extends{id: string}>(items: T[], item: T) {
  const exists = items.some((currentItem) => currentItem.id === item.id);
  if (exists) {
    return items.map((currentItem) => (currentItem.id === item.id ? item : currentItem));
  }
  return [...items, item];
}

const DRAFT_RADAR_ID = "draft-radar";
const DRAFT_LATITUDE_ID = "draft-latitude";
const DRAFT_LONGITUDE_ID = "draft-longitude";

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scaleUnit, setScaleUnit] = useState<"metric" | "imperial">("imperial");

  const [mode, setMode] = useState<PlayingAreaMode>("idle");
  const [drawingPoints, setDrawingPoints] = useState<MapPoint[]>([]);
  const [playingArea, setPlayingArea] = useState<GeoJSON.Polygon | null>(null);
  const [questionFlow, setQuestionFlow] = useState<QuestionFlow>({ kind: "closed" });

  const [radarQuestions, setRadarQuestions] = useState<RadarQuestion[]>([]);
  const [latitudeQuestions, setLatitudeQuestions] = useState<LatitudeQuestion[]>([]);
  const [longitudeQuestions, setLongitudeQuestions] = useState<LongitudeQuestion[]>([]);

  const startDrawingArea = () => {
    setMode("drawing");
    setDrawingPoints([]);
    setPlayingArea(null);
    setRadarQuestions([]);
    setLatitudeQuestions([]);
    setLongitudeQuestions([]);
    setQuestionFlow({ kind: "closed" });
  };

  const cancelDrawingArea = () => {
    setMode("idle");
    setDrawingPoints([]);
    setQuestionFlow({ kind: "closed" })
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
    setQuestionFlow({ kind: "menu" });
  }

  function formatRadarRadiusText(radiusKm: number, scaleUnit: "metric" | "imperial") {
    const radiusValue = scaleUnit === "imperial" ? radiusKm / 1.609344 : radiusKm;
    return String(Number(radiusValue.toFixed(2)));
  }

  const startRadarQuestion = () => {
    setQuestionFlow({
      kind: "radar",
      draft: {
        radiusText: "1",
        result: "out",
        centerPoint: null,
        editingRadarId: null,
      },
    });
  };

  const startLatitudeQuestion = () => {
    setQuestionFlow({
      kind: "latitude",
      draft: {
        result: "above",
        point: null,
        editingLatitudeId: null,
      },
    });
  };

  const startLongitudeQuestion = () => {
    setQuestionFlow({
      kind: "latitude",
      draft: {
        result: "above",
        point: null,
        editingLatitudeId: null,
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
        editingRadarId: radarQuestion.id,
      },
    });
  };

  const editLatitudeQuestion = (latitudeQuestionId: string) => {
    const latitudeQuestion = latitudeQuestions.find((question) => question.id === latitudeQuestionId);
    if (!latitudeQuestion) return;

    setQuestionFlow({
      kind: "latitude",
      draft: {
        result: latitudeQuestion.result,
        point: latitudeQuestion.point,
        editingLatitudeId: latitudeQuestion.id,
      },
    });
  };

  const editLongitudeQuestion = (longitudeQuestionId: string) => {
    const longitudeQuestion = longitudeQuestions.find((question) => question.id === longitudeQuestionId);
    if (!longitudeQuestion) return;

    setQuestionFlow({
      kind: "longitude",
      draft: {
        result: longitudeQuestion.result,
        point: longitudeQuestion.point,
        editingLongitudeId: longitudeQuestion.id,
      },
    });
  };

  const updateRadar = (updates: Partial<{
    radiusText: string;
    result: RadarResult;
    centerPoint: MapPoint | null;
  }>) => {
    if (questionFlow.kind !== "radar") return;

    const nextRadiusText = updates.radiusText !== undefined ? updates.radiusText : questionFlow.draft.radiusText;
    const nextResult = updates.result !== undefined ? updates.result : questionFlow.draft.result;
    const nextCenterPoint = updates.centerPoint !== undefined ? updates.centerPoint : questionFlow.draft.centerPoint;
    const radiusValue = Number(nextRadiusText);

    const previewId = questionFlow.draft.editingRadarId ?? DRAFT_RADAR_ID;
    const isEditingExistingQuestion = questionFlow.draft.editingRadarId !== null;
    const hasValidDraft = Number.isFinite(radiusValue) && radiusValue > 0 && nextCenterPoint;

    if (!hasValidDraft) {
      if (!isEditingExistingQuestion){
        setRadarQuestions((current) => current.filter((question) => question.id != previewId));
      }
    } else {
      const radiusKm = scaleUnit === "imperial" ? radiusValue * 1.60934 : radiusValue;
      const updatedQuestion: RadarQuestion = {
        id: previewId,
        centerPoint: nextCenterPoint,
        radiusKm,
        result: nextResult,
      };

      setRadarQuestions((current) => addOrUpdate(current, updatedQuestion));

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

  const updateLatitude = (updates: Partial<{
    result: LatitudeResult;
    point: MapPoint | null;
  }>) => {
    if (questionFlow.kind !== "latitude") return;

    const nextPoint = updates.point !== undefined? updates.point : questionFlow.draft.point;
    const nextResult = updates.result !== undefined? updates.result : questionFlow.draft.result;
    const previewId = questionFlow.draft.editingLatitudeId ?? DRAFT_LATITUDE_ID;
    const isEditingExistingQuestion = questionFlow.draft.editingLatitudeId !== null;

    if (!nextPoint){
      if (!isEditingExistingQuestion) {
        setLatitudeQuestions((current) => current.filter((question) => question.id !== previewId));
      }
    } else {
      const updatedQuestion: LatitudeQuestion = {
        id: previewId,
        point: nextPoint,
        result: nextResult,
      };
      setLatitudeQuestions((current) => addOrUpdate(current, updatedQuestion));
    }

    setQuestionFlow((current) => {
      if (current.kind !== "latitude") return current;
      return {
        kind: "latitude",
        draft: {
          ...current.draft,
          ...updates,
        },
      };
    });
  };

  const updateLongitude = (updates: Partial<{
    result: LongitudeResult;
    point: MapPoint | null;
  }>) => {
    if (questionFlow.kind !== "longitude") return;

    const nextPoint = updates.point !== undefined? updates.point : questionFlow.draft.point;
    const nextResult = updates.result !== undefined? updates.result : questionFlow.draft.result;
    const previewId = questionFlow.draft.editingLongitudeId ?? DRAFT_LONGITUDE_ID;
    const isEditingExistingQuestion = questionFlow.draft.editingLongitudeId !== null;

    if (!nextPoint) {
      if (!isEditingExistingQuestion) {
        setLongitudeQuestions((current) => current.filter((question) => question.id !== previewId));
      }
    } else {
      const updatedQuestion: LongitudeQuestion = {
        id: previewId,
        point: nextPoint,
        result: nextResult,
      };
      setLongitudeQuestions((current) => addOrUpdate(current, updatedQuestion));
    }

    setQuestionFlow((current) => {
      if (current.kind !== "longitude") return current;
      return {
        kind: "longitude",
        draft: {
          ...current.draft,
          ...updates,
        },
      };
    });
  }



  const saveRadarQuestion = () => {
    if (questionFlow.kind !== "radar") return;
    const radiusValue = Number(questionFlow.draft.radiusText);
    if (!Number.isFinite(radiusValue) || radiusValue <= 0) return;
    if (!questionFlow.draft.centerPoint) return;

    const radiusKm = scaleUnit === "imperial" ? radiusValue * 1.60934 : radiusValue;
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
      return current.map((q) => q.id === DRAFT_RADAR_ID ? nextQuestion : q);
    });
    setQuestionFlow({ kind: "closed" });
  };

  const saveLatitudeQuestion = () => {
    if (questionFlow.kind !== "latitude") return;
    if (!questionFlow.draft.point) return;

    const finalId = questionFlow.draft.editingLatitudeId ?? String(Date.now()) + String(Math.random());
    const nextQuestion: LatitudeQuestion = {
      id: finalId,
      point: questionFlow.draft.point,
      result: questionFlow.draft.result,
    };

    setLatitudeQuestions((current) => {
      if (questionFlow.draft.editingLatitudeId) {
        return current.map((q) => (q.id == finalId ? nextQuestion : q));
      }
      return current.map((q) => (q.id === DRAFT_LATITUDE_ID ? nextQuestion : q));
    });

    setQuestionFlow({kind: "closed"});
  };

  const saveLongitudeQuestion = () => {
    if (questionFlow.kind !== "longitude") return;
    if (!questionFlow.draft.point) return;

    const finalId = questionFlow.draft.editingLongitudeId ?? String(Date.now()) + String(Math.random());
    const nextQuestion: LongitudeQuestion = {
      id: finalId,
      point: questionFlow.draft.point,
      result: questionFlow.draft.result,
    };

    setLongitudeQuestions((current) => {
      if (questionFlow.draft.editingLongitudeId) {
        return current.map((q) => (q.id === finalId ? nextQuestion : q));
      }
      return current.map((q) => (q.id === DRAFT_LONGITUDE_ID ? nextQuestion : q));
    })

    setQuestionFlow({kind: "closed"})
  }

  const cancelQuestionFlow = () => {
    if (questionFlow.kind === "radar" && !questionFlow.draft.editingRadarId) {
      setRadarQuestions((current) => current.filter((q) => q.id !== DRAFT_RADAR_ID));
    }

    if (questionFlow.kind === "latitude" && !questionFlow.draft.editingLatitudeId) {
      setLatitudeQuestions((current) => current.filter((q) => q.id !== DRAFT_LATITUDE_ID));
    }

    if (questionFlow.kind === "longitude" && !questionFlow.draft.editingLongitudeId) {
      setLongitudeQuestions((current) => current.filter((q) => q.id !== DRAFT_LONGITUDE_ID))
    }

    setQuestionFlow({ kind: "closed" });
  }

  const handleMapClick = (point: MapPoint) => {
    if (mapMode === "drawing") {
      if (wouldCreateIntersection(drawingPoints, point)) return;
      setDrawingPoints((current) => [...current, point]);
      return;
    }

    if (mapMode === "radar-picking-center") {
      updateRadar({centerPoint: point})
    }

    if (mapMode === "latitude-picking-point") {
      updateLatitude({point});
    }

    if (mapMode === "longitude-picking-point") {
      updateLongitude({point});
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
        : questionFlow.kind === "latitude" ? "latitude-picking-point"
          : questionFlow.kind === "longitude" ? "longitude-picking-point"
            : "idle";

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      <Sidebar
        width={320}
        mode={mode}
        hasPlayingArea={playingArea !== null}
        pointsCount={drawingPoints.length}
        questionFlow={questionFlow}
        scaleUnit={scaleUnit}
        radarQuestions={radarQuestions}
        latitudeQuestions={latitudeQuestions}
        longitudeQuestions={longitudeQuestions}
        onCreatePlayingArea={startDrawingArea}
        onFinishPlayingArea={finishDrawingArea}
        onCancelPlayingArea={cancelDrawingArea}
        onOpenQuestionMenu={openQuestionMenu}
        onStartRadarQuestion={startRadarQuestion}
        onStartLatitudeQuestion={startLatitudeQuestion}
        onStartLongitudeQuestion={startLongitudeQuestion}
        onEditRadarQuestion={editRadarQuestion}
        onEditLatitudeQuestion={editLatitudeQuestion}
        onEditLongitudeQuestion={editLongitudeQuestion}
        onUpdateRadarDraft={updateRadar}
        onUpdateLatitudeDraft={updateLatitude}
        onUpdateLongitudeDraft={updateLongitude}
        onSaveRadarQuestion={saveRadarQuestion}
        onSaveLatitudeQuestion={saveLatitudeQuestion}
        onSaveLongitudeQuestion={saveLongitudeQuestion}
        onCancelQuestionFlow={cancelQuestionFlow}
      />

      <div style={{ position: "relative", flex: 1, height: "100%" }}>
        <MapView
          scaleUnit={scaleUnit}
          mode={mapMode}
          drawingPoints={drawingPoints}
          playingArea={playingArea}
          radarQuestions={radarQuestions}
          latitudeQuestions={latitudeQuestions}
          longitudeQuestions={longitudeQuestions}
          onMapClick={handleMapClick}
          onFirstPointClick={handleFirstPointClick}
        />

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="sidebar-button"
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