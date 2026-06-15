import type {PlayingAreaMode, RadarResult, QuestionFlow} from "./Types";

type SidebarProps = {
    width: number;
    mode: PlayingAreaMode;
    hasPlayingArea: boolean;
    pointsCount: number;
    questionFlow: QuestionFlow;
    onCreatePlayingArea: () => void;
    onFinishPlayingArea: () => void;
    onCancelPlayingArea: () => void;
    onOpenQuestionMenu: () => void;
    onStartRadarQuestion: () => void;
    onUpdateRadarDraft: (updates: Partial<{
        radiusKm: number;
        result: RadarResult;
    }>) => void;
    onPickRadarCenter: () => void;
    onSaveRadarQuestion: () => void;
    onCancelQuestionFlow: () => void;
};

export default function Sidebar({
    width,
    mode,
    hasPlayingArea,
    pointsCount,
    questionFlow,
    onCreatePlayingArea,
    onFinishPlayingArea,
    onCancelPlayingArea,
    onOpenQuestionMenu,
    onStartRadarQuestion,
    onUpdateRadarDraft,
    onPickRadarCenter,
    onSaveRadarQuestion,
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

           {hasPlayingArea && mode === "set" && questionFlow.kind === "radar" ? (
            <>
                <p style={{marginBottom: 16}}>Radar question</p>
                <label style={{display: "block", marginBottom: 8}}>
                    Radius (km)
                </label>
                <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={questionFlow.draft.radiusKm}
                    onChange={(event) => {
                        const next = Number(event.target.value);
                        if (!Number.isFinite(next) || next <= 0) return;
                        onUpdateRadarDraft({radiusKm:next});
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
                    value={questionFlow.draft.result}
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
                    <option value="in">Inside radar</option>
                    <option value="out">Outside radar</option>
                </select>
                <p style={{marginBottom: 8}}>
                    {questionFlow.draft.centerPoint? "Center selected" : "No center selected"}
                </p>

                <div style={{display: "block", gap: 8, marginBottom: 8}}>
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
                    >Pick center</button>

                    <button
                        onClick={onSaveRadarQuestion}
                        disabled={!questionFlow.draft.centerPoint}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid gray",
                            background: !questionFlow.draft.centerPoint ? "darkgray" : "black",
                            color: !questionFlow.draft.centerPoint ? "lightgray" : "white",
                            cursor: !questionFlow.draft.centerPoint? "not-allowed" : "pointer",
                        }}
                    >Save radar</button>
                </div>

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
           ):null}

        </aside>
    );
}