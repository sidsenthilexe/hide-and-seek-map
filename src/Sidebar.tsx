type SidebarPanel = {
    width: number;
    mode: "idle" | "drawing" |"set";
    hasPlayingArea: boolean;
    pointsCount: number;
    onCreatePlayingArea: () => void;
    onFinishPlayingArea: () => void;
    onCancelPlayingArea: () => void;
};

export default function Sidebar({
    width,
    mode,
    hasPlayingArea,
    pointsCount,
    onCreatePlayingArea,
    onFinishPlayingArea,
    onCancelPlayingArea,
}: SidebarPanel) {
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

           {hasPlayingArea && mode ==="set" ? (
            <>
                <p style={{marginBottom: 16}}>Playing area set.</p>
                <button
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

        </aside>
    );
}