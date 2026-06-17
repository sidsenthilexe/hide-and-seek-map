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
                flexShrink: 0,
                height: "100vh",
                overflowY: "auto",
            }}
        >
            <h2 style={{marginTop:0}}>Game</h2>
            
           {!hasPlayingArea && !isDrawing ? (
            <>
                <p style={{marginBottom: 16}}>No playing area set yet</p>
                <button
                    onClick={onCreatePlayingArea}
                    className="sidebar-button"
                    style={{padding: "12px 16px"}}
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
                        className="sidebar-button"
                        style={{padding: "12px 16px"}}
                    >
                        Finish area
                    </button>

                    <button
                        onClick={onCancelPlayingArea}
                        className = "sidebar-button"
                        style={{padding: "12px 16px"}}
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
                    className="sidebar-button"
                    style={{padding: "12px 16px"}}
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
                                        Radius: {scaleUnit==="metric" ? `${question.radiusKm.toFixed(2)} km` : `${(question.radiusKm / 1.609344).toFixed(2)} mi`}
                                    </p>
                                    <p style={{margin: 0, marginBottom: 4}}>Result: {question.result === "in"?"Inside" : "Outside"}</p>
                                    <button
                                        onClick={() => onEditRadarQuestion(question.id)}
                                        className="sidebar-button"
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
                        className = {`sidebar-button ${questionFlow.draft.isPickingCenter}`}
                    >
                        {questionFlow.draft.isPickingCenter ? "Click map to save" : "Pick center"}
                    </button>
                </div>

                <p style={{marginBottom: 8}}>
                    The radar saves when you click the map after picking the center.
                </p>

                <button
                    onClick={onCancelQuestionFlow}
                    className = "sidebar-button"
                >Cancel</button>
            </>
           ) : null}

           {hasPlayingArea && mode === "set" && questionFlow.kind === "menu" ? (
            <>
                <p style={{marginBottom: 16}}>Choose a question type:</p>
                <div style={{display:"flex", gap:8}}>
                    <button
                        onClick={onStartRadarQuestion}
                        className = "sidebar-button"
                        style= {{padding: "12px 16px"}}
                    >Radar</button>

                    <button
                        onClick={onCancelQuestionFlow}
                        className = "sidebar-button"
                    >Cancel</button>
                </div>
            </>
           ):null}

        </aside>
    );
}