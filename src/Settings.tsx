import { useEffect } from "react";

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

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key ==="Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return() => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            onClick = {onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: "transparent",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "absolute",
                    top: 64,
                    right: 16,
                    background: "black",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 16,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    minWidth: 200,
                }}
            >
                <div style = {{marginBottom: 8, fontWeight: 600}}>Settings</div>
                <label style={{display: "block", marginBottom: 8}}>
                    Scale Units:
                    <select
                        value = {scaleUnit}
                        onChange= {(e) =>
                            onChangeScaleUnit(e.target.value as "metric" | "imperial")
                        }
                        style={{marginLeft:8}}
                    >
                        <option value="metric">Metric</option>
                        <option value="imperial">Imperial</option>
                    </select>
                </label>
                        
            </div>
        </div>
    )
}