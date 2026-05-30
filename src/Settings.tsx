type SettingsPanel = {
    isOpen: boolean;
    scaleUnit: "metric" | "imperial";
    onChangeScaleUnit: (unit: "metric" | "imperial") => void;
    onClose: () => void;
}

export default function Settings({
    isOpen,
    scaleUnit,
    onChangeScaleUnit,
    onClose,
}: SettingsPanel) {
    if (!isOpen) return null;

    return (
        <div
        style={{
            position: "absolute",
            top: 64,
            right: 16,
            zIndex: 16,
            background: "black",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            minWidth: 200,
        }}
    >
        <div style={{marginBottom: 8, fontWeight: 600}}>Settings</div>
        <label style={{display: "block", marginBottom: 8}}>
            Scale Units:
            <select
                value = {scaleUnit}
                onChange={(e) => onChangeScaleUnit(e.target.value as "metric" | "imperial")}
                style = {{marginLeft: 8}}
            >
                <option value="metric">Metric</option>
                <option value="imperial"> Imperial</option>
            </select>
        </label>

        <button
            onClick={onClose}
            style={{
                padding: "8px 8px",
                borderRadius: 8,
                border: "1px solid #ccc",
                background: "#f7f7f7",
                cursor: "pointer",
            }}
        >Close</button>
    </div>
    );
}