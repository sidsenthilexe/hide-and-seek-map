type SidebarPanel = {
    width: number;
    hasPlayingArea: boolean;
    onCreatePlayingArea: () => void;
};

export default function Sidebar({
    width,
    hasPlayingArea,
    onCreatePlayingArea,
}:SidebarPanel) {
    return(
        <aside
            style = {{
                width,
                padding: 16,
                borderRight: "1px solid gray",
                background: "black",
                color: "white",
            }}
        >
            <h2 style={{marginTop: 0}}>Game</h2>

            {!hasPlayingArea ? (
                <>
                    <p style={{marginBottom: 16}}>
                        No playing area set yet.
                    </p>
                    <button
                        onClick ={onCreatePlayingArea}
                        style={{
                            padding:"16px 16px",
                            borderRadius: 8,
                            border:"1px solid gray",
                            background: "black",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                    Set playing area
                    </button>
                </>
            ) :(
                <>
                    <p style={{marginBottom: 16}}>
                        Playing area set.
                    </p>
                    <button
                        style={{
                            padding:"16px 16px",
                            borderRadius: 8,
                            border:"1px solid gray",
                            background: "black",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        Askquestion
                    </button>
                </>
            )

            }

        </aside>
    );
}