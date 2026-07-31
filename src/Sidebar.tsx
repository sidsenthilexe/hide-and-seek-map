import type { 
    PlayingAreaMode, 
    RadarQuestion, 
    RadarResult,
    LatitudeQuestion,
    LatitudeResult,
    LongitudeQuestion,
    LongitudeResult, 
    QuestionFlow,
} from "./Types";

type ScaleUnit = "imperial" | "metric";

type SidebarProps = {
    width: number;
    mode: PlayingAreaMode;
    hasPlayingArea: boolean;
    pointsCount: number;
    questionFlow: QuestionFlow;
    scaleUnit: ScaleUnit;
    radarQuestions: RadarQuestion[];
    latitudeQuestions: LatitudeQuestion[];
    longitudeQuestions: LongitudeQuestion[];
    onCreatePlayingArea: () => void;
    onFinishPlayingArea: () => void;
    onCancelPlayingArea: () => void;
    onOpenQuestionMenu: () => void;
    onStartRadarQuestion: () => void;
    onStartLatitudeQuestion: () => void;
    onStartLongitudeQuestion: () => void;
    onEditRadarQuestion: (radarQuestionId: string) => void;
    onEditLatitudeQuestion: (latitudeQuestionId: string) => void;
    onEditLongitudeQuestion: (longitudeQuestionId: string) => void;
    onUpdateRadarDraft: (updates: Partial<{
        radiusText: string;
        result: RadarResult;
    }>) => void;
    onUpdateLatitudeDraft: (updates: Partial<{
        result: LatitudeResult;
        point: [number, number] | null;
    }>) => void;
    onUpdateLongitudeDraft: (updates: Partial<{
        result: LongitudeResult;
        point: [number, number] | null;
    }>) => void;
    onSaveRadarQuestion: () => void;
    onSaveLatitudeQuestion: () => void;
    onSaveLongitudeQuestion: () => void;
    onCancelQuestionFlow: () => void;
};

function formatPoint(point: [number, number]) {
    return `Lat ${point[1].toFixed(4)}, Lng ${point[0].toFixed(4)}`;
}

export default function Sidebar({
    width,
    mode,
    hasPlayingArea,
    pointsCount,
    questionFlow,
    scaleUnit,
    radarQuestions,
    latitudeQuestions,
    longitudeQuestions,
    onCreatePlayingArea,
    onFinishPlayingArea,
    onCancelPlayingArea,
    onOpenQuestionMenu,
    onStartRadarQuestion,
    onStartLatitudeQuestion,
    onStartLongitudeQuestion,
    onEditRadarQuestion,
    onEditLatitudeQuestion,
    onEditLongitudeQuestion,
    onUpdateRadarDraft,
    onUpdateLatitudeDraft,
    onUpdateLongitudeDraft,
    onSaveRadarQuestion,
    onSaveLatitudeQuestion,
    onSaveLongitudeQuestion,
    onCancelQuestionFlow,
}: SidebarProps) {
    const isDrawing = mode === "drawing";

    return (
        <aside
            style={{
                width,
                padding: 16,
                borderRight: "1px solid gray",
                background: "black",
                color: "white",
                boxSizing: "border-box",
                flexShrink: 0,
                height: "100vh",
                overflowY: "auto",
            }}
        >
            <h2 style={{ marginTop: 0 }}>Hide and Seek Map</h2>

            {!hasPlayingArea && !isDrawing ? (
                <>
                    <p style={{ marginBottom: 16 }}>No playing area set yet</p>
                    <button
                        onClick={onCreatePlayingArea}
                        className="sidebar-button sidebar-button-padded"
                    >
                        Set playing area
                    </button>
                </>
            ) : null}

            {isDrawing ? (
                <>
                    <p style={{ marginBottom: 12 }}>
                        Click the map to add points. You need at least 3 points to create a playing area.
                    </p>
                    <p style={{ marginBottom: 16 }}>Points placed: {pointsCount}</p>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={onFinishPlayingArea}
                            disabled={pointsCount < 3}
                            className="sidebar-button  sidebar-button-padded"
                        >
                            Finish area
                        </button>

                        <button
                            onClick={onCancelPlayingArea}
                            className="sidebar-button sidebar-button-padded"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            ) : null}

            {hasPlayingArea && mode === "set" && questionFlow.kind === "closed" ? (
                <>
                    <p style={{ marginBottom: 16 }}>Playing area set.</p>
                    <button
                        onClick={onOpenQuestionMenu}
                        className="sidebar-button sidebar-button-padded"
                    >
                        Ask question
                    </button>

                    {radarQuestions.length > 0 ? (
                        <div style={{ marginTop: 16 }}>
                            <p style={{ marginBottom: 8 }}>Asked questions</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {radarQuestions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        style={{
                                            border: "1px solid gray",
                                            borderRadius: 8,
                                            padding: 8,
                                        }}
                                    >
                                        <p style={{ margin: 0, marginBottom: 4 }}>Radar {index + 1}</p>
                                        <p style={{ margin: 0, marginBottom: 4 }}>
                                            Radius: {scaleUnit === "metric" ? `${question.radiusKm.toFixed(2)} km` : `${(question.radiusKm / 1.609344).toFixed(2)} mi`}
                                        </p>
                                        <p style={{ margin: 0, marginBottom: 4 }}>Result: {question.result === "in" ? "Inside" : "Outside"}</p>
                                        <p style={{margin: 0, marginBottom: 4}}>
                                            Center: {formatPoint(question.centerPoint)}
                                        </p>
                                        <button
                                            onClick={() => onEditRadarQuestion(question.id)}
                                            className="sidebar-button"
                                        >Edit</button>
                                    </div>
                                ))}

                                {latitudeQuestions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        style={{
                                            border: "1px solid gray",
                                            borderRadius: 8,
                                            padding: 8,
                                        }}
                                    >
                                        <p style={{margin: 0, marginBottom: 4}}>Latitude {index + 1}</p>
                                        <p style={{margin: 0, marginBottom: 4}}>
                                            Result: {question.result === "above" ? "Above" : "Below"}
                                        </p>
                                        <p style={{margin: 0, marginBottom: 4}}>
                                            Point: {formatPoint(question.point)}
                                        </p>
                                        <button
                                            onClick={() => onEditLatitudeQuestion(question.id)}
                                            className = "sidebar-button"
                                        >
                                        Edit
                                        </button>
                                    </div>
                                ))}

                                {longitudeQuestions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        style={{
                                            border: "1px solid gray",
                                            borderRadius: 8,
                                            padding: 8,
                                        }}
                                    >
                                        <p style={{margin: 0, marginBottom: 4}}>Longitude {index+1}</p>
                                        <p style={{margin: 0, marginBottom: 4}}>
                                            Result: {question.result === "left" ? "Left" : "Right"}
                                        </p>
                                        <p style={{margin: 0, marginBottom: 4}}>
                                            Point: {formatPoint(question.point)}
                                        </p>
                                        <button
                                            onClick={() => onEditLongitudeQuestion(question.id)}
                                            className = "sidebar-button"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </>
            ) : null}

            {hasPlayingArea && mode === "set" && questionFlow.kind === "radar" ? (
                <>
                    <p style={{ marginBottom: 16 }}>{questionFlow.draft.editingRadarId ? "Edit radar" : "Radar"}</p>
                    <label style={{ display: "block", marginBottom: 8 }}>Radius ({scaleUnit === "metric" ? "km" : "mi"})</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={questionFlow.draft.radiusText}
                        onChange={(event) => {
                            onUpdateRadarDraft({ radiusText: event.target.value });
                        }}
                        style={{
                            width: "100%",
                            marginBottom: 8,
                            padding: 8,
                            borderRadius: 8,
                            border: "1px solid gray",
                            background: "black",
                            color: "white",
                            boxSizing: "border-box",
                        }}
                    />

                    <label style={{ display: "block", marginBottom: 8 }}>Hider result</label>
                    <select
                        value={questionFlow.draft.result}
                        onChange={(event) => onUpdateRadarDraft({ result: event.target.value as RadarResult })}
                        style={{
                            width: "100%",
                            marginBottom: 8,
                            padding: 8,
                            borderRadius: 8,
                            border: "1px solid gray",
                            background: "black",
                            color: "white",
                            boxSizing: "border-box",
                        }}
                    >
                        <option value="in">In</option>
                        <option value="out">Out</option>
                    </select>
                    <p style={{ marginBottom: 8 }}>
                        Click anywhere on the map to place the center.
                    </p>
                    <p style={{ marginBottom: 8, fontWeight: "bold" }}>
                        {questionFlow.draft.centerPoint ? "Center selected" : "No center selected"}
                    </p>

                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button
                            onClick={onSaveRadarQuestion}
                            disabled={!questionFlow.draft.centerPoint || !Number(questionFlow.draft.radiusText)}
                            className="sidebar-button sidebar-button-padded"
                        >
                            Save
                        </button>

                        <button
                            onClick={onCancelQuestionFlow}
                            className="sidebar-button sidebar-button-padded"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            ) : null}

            {hasPlayingArea && mode === "set" && questionFlow.kind === "latitude" ? (
                <>
                    <p style={{marginBottom: 16}}>
                        {questionFlow.draft.editingLatitudeId ? "Edit latitude" : "Latitude"}
                    </p>

                    <label style={{display: "block", marginBottom: 8}}>Hider result</label>
                    <select
                        value={questionFlow.draft.result}
                        onChange={(event) => onUpdateLatitudeDraft({result: event.target.value as LatitudeResult})}
                        style={{
                            width: "100%",
                            marginBottom: 8,
                            padding: 8,
                            borderRadius: 8,
                            border: "1px solid gray",
                            background: "black",
                            color: "white",
                            boxSizing: "border-box",
                        }}
                    >
                        <option value="above">Above</option>
                        <option value="below">Below</option>
                    </select>
                    <p style={{marginBottom: 8}}>
                        Click to place the question's reference point.
                    </p>
                    <p style={{marginBottom: 8, fontWeight: "bold"}}>
                        {questionFlow.draft.point ? "Point selected" : "No point selected"}
                    </p>

                    <div style={{display: "flex", gap: 8, marginTop:16}}>
                        <button
                            onClick={onSaveLatitudeQuestion}
                            disabled={!questionFlow.draft.point}
                            className="sidebar-button sidebar-button-padded"
                        >
                            Save
                        </button>

                        <button
                            onClick={onCancelQuestionFlow}
                            className="sidebar-button sidebar-button-padded"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            ) : null}

            {hasPlayingArea && mode === "set" && questionFlow.kind === "longitude" ? (
                <>
                    <p style={{marginBottom: 16}}>
                        {questionFlow.draft.editingLongitudeId ? "Edit longitude" : "Longitude"}
                    </p>

                    <label style={{display: "block", marginBottom: 8}}>Hider result</label>
                    <select
                        value={questionFlow.draft.result}
                        onChange={(event) => onUpdateLongitudeDraft({result: event.target.value as LongitudeResult})}
                        style={{
                            width: "100%",
                            marginBottom: 8,
                            padding: 8,
                            borderRadius: 8,
                            border: "1px solid gray",
                            background: "black",
                            color: "white",
                            boxSizing: "border-box",
                        }}
                    >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                    </select>

                    <p style={{marginBottom: 8}}>
                        Click to place the question's reference point.
                    </p>
                    <p style={{marginBottom: 8, fontWeight: "bold"}}>
                        {questionFlow.draft.point ? "Point selected" : "No point selected"}
                    </p>
                    <div style={{display: "flex", gap: 8, marginTop: 16}}>
                        <button
                            onClick={onSaveLongitudeQuestion}
                            disabled={!questionFlow.draft.point}
                            className="sidebar-button sidebar-button-padded"
                        >
                            Save
                        </button>

                        <button
                            onClick={onCancelQuestionFlow}
                            className="sidebar-button sidebar-button-padded"
                        >
                            Cancel
                        </button>
                    </div>

                </>
            ) : null}

            {hasPlayingArea && mode === "set" && questionFlow.kind === "menu" ? (
                <>
                    <p style={{ marginBottom: 16 }}>Choose a question type:</p>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={onStartRadarQuestion}
                            className="sidebar-button sidebar-button-padded"
                        >Radar</button>

                        <button
                            onClick={onStartLatitudeQuestion}
                            className="sidebar-button sidebar-button-padded"
                        >
                            Latitude
                        </button>

                        <button
                            onClick={onStartLongitudeQuestion}
                            className="sidebar-button sidebar-button-padded"
                        >
                            Longitude
                        </button>

                        <button
                            onClick={onCancelQuestionFlow}
                            className="sidebar-button"
                        >Cancel</button>
                    </div>
                </>
            ) : null}

        </aside>
    );
}