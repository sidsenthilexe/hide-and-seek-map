import type {PlayingAreaMode, RadarQuestion, RadarResult, QuestionFlow} from "./Types";

type ScaleUnit = "imperial" | "metric";

type SidebarProps = {
    width: number;
    mode: PlayingAreaMode;
    hasPlayingArea: boolean;
    pointsCount: number;
    questionFlow: QuestionFlow;
    scaleUnit: ScaleUnit;
    radarQuestions: RadarQuestion[];
    onCreatePlayingArea: () => void;
    onFinishPlayingArea: () => void;
    onCancelPlayingArea: () => void;
    onOpenQuestionMenu: () => void;
    onStartRadarQuestion: () => void;
    onEditRadarQuestion: (radarQuestionId: string) => void;
    onUpdateRadarDraft: (updates: Partial<{
        radiusText: string;
        result: RadarResult;
    }>) => void;
    onPickRadarCenter: () => void;
    onCancelQuestionFlow: () => void;
};

export default function Sidebar({
    width,
    mode,
    hasPlayingArea,
    pointsCount,
    questionFlow,
    scaleUnit,
    radarQuestions,
    onCreatePlayingArea,
    onFinishPlayingArea,
    onCancelPlayingArea,
    onOpenQuestionMenu,
    onStartRadarQuestion,
    onEditRadarQuestion,
    onUpdateRadarDraft,
    onPickRadarCenter,
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
                flexShrink: 0
            }}
        >
            <h2 style={{marginTop:0}}>Game</h2>
            
           {!hasPlayingArea && !isDrawing ? (
            <>
                <p style={{marginBottom: 16}}>No playing area set yet</p>
                <button
                    onClick={onCreatePlayingArea}
                    style={{
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid gray",
                        background: "black",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    Set playing area
                </button>
            </>
           ) : null} 

           {isDrawing ? (
            <>
                <p style={{marginBottom: 12}}>
                    Click the map to add points. You need at least 3 points to create a playing area.
                </p>
                <p style={{marginBottom: 16}}>Points placed: {pointsCount}</p>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={onFinishPlayingArea}
                        disabled={pointsCount < 3}
                        style={{
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: "1px solid gray",
                            background: pointsCount < 3 ? "darkgray" : "black",
                            color: pointsCount <  3 ? "lightgray" : "white",
                            cursor: pointsCount < 3 ? "not-allowed": "pointer",
                        }}
                    >
                        Finish area
                    </button>

                    <button
                        onClick={onCancelPlayingArea}
                        style={{
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: "1px solid gray",
                            background: "black",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </>
           ) : null}

           {hasPlayingArea && mode ==="set" && questionFlow.kind === "closed" ? (
            <>
                <p style={{marginBottom: 16}}>Playing area set.</p>
                <button
                    onClick={onOpenQuestionMenu}
                    style={{
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid gray",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    Ask question
                </button>

                {radarQuestions.length > 0 ? (
                    <div style={{marginTop: 16}}>
                        <p style={{marginBottom: 8}}>Asked questions</p>
                        <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                            {radarQuestions.map((question, index) => (
                                <div
                                    key = {question.id}
                                    style = {{
                                        border: "1px solid gray",
                                        borderRadius: 8,
                                        padding: 8,
                                    }}
                                >
                                    <p style={{margin: 0, marginBottom: 4}}>Radar {index + 1}</p>
                                    <p style={{margin: 0, marginBottom: 4}}>
                                        Radius: {scaleUnit==="metric" ? `${question.radiusKm.toFixed(2)} km` : `${(question.radiusKm / 1,609344).toFixed(2)} mi`}
                                    </p>
                                    <p style={{margin: 0, marginBottom: 4}}>Result: {question.result === "in"?"Inside" : "Outside"}</p>
                                    <button
                                        onClick={() => onEditRadarQuestion(question.id)}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "1px solid gray",
                                            background: "black",
                                            color: "white",
                                            cursor: "pointer",
                                        }}
                                    >Edit</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ):null}
            </>
           ) : null}

           {hasPlayingArea && mode === "set" && questionFlow.kind === "radar" ? (
            <>
                <p style={{marginBottom: 16}}>{questionFlow.draft.editingRadarId?"Edit radar" : "Radar"}</p>
                <label style={{display: "block", marginBottom: 8}}>Radius ({scaleUnit==="metric" ? "km" : "mi"})</label>
                <input
                    type = "text"
                    inputMode = "decimal"
                    value = {questionFlow.draft.radiusText}
                    onChange={(event) => {
                        onUpdateRadarDraft({radiusText: event.target.value});
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

                <label style={{display: "block", marginBottom: 8}}>Hider result</label>
                <select
                    value = {questionFlow.draft.result}
                    onChange={(event) => onUpdateRadarDraft({result: event.target.value as RadarResult})}
                    style={{
                        width: "100%",
                        marginBottom: 8,
                        padding: 8,
                        borderRadius: 8,
                        border: "1px solid gray",
                        color: "white",
                        boxSizing: "border-box",
                    }}
                >
                    <option value="in">In</option>
                    <option value="out">Out</option>
                </select>
                <p style={{marginBottom: 8}}>
                    {questionFlow.draft.centerPoint ? "Center selected" : "No center selected"}
                </p>

                <div style={{display: "flex", gap: 8, marginBottom: 8}}>
                    <button
                        onClick={onPickRadarCenter}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid gray",
                            background: questionFlow.draft.isPickingCenter ? "darkgray" : "black",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        {questionFlow.draft.isPickingCenter ? "Click map to save" : "Pick center"}
                    </button>
                </div>

                <p style={{marginBottom: 8}}>
                    The radar saves when you click the map after picking the center.
                </p>

                <button
                    onClick={onCancelQuestionFlow}
                    style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid gray",
                        background: "black",
                        color: "white",
                        cursor: "pointer",
                    }}
                >Cancel</button>
            </>
           ) : null}

           {hasPlayingArea && mode === "set" && questionFlow.kind === "menu" ? (
            <>
                <p style={{marginBottom: 16}}>Choose a questionitype:</p>
                <div style={{display:"flex", gap:8}}>
                    <button
                        onClick={onStartRadarQuestion}
                        style={{
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: "1px solid gray",
                            background: "black",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >Radar</button>

                    <button
                        onClick={onCancelQuestionFlow}
                        style={{
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: "1px solid gray",
                            background: "black",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >Cancel</button>
                </div>
            </>
           ):null}

        </aside>
    );
}