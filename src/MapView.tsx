import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type ScaleUnit = "metric" | "imperial";

export default function MapView({scaleUnit}: {scaleUnit: ScaleUnit}) {
    const mapContainerRef = useRef<HTMLDivElement | null> (null);
    const mapRef = useRef<Map | null>(null);
    const protomapsKey = import.meta.env.VITE_PROTOMAPS_KEY;
    const scaleRef = useRef<maplibregl.ScaleControl | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;
        mapRef.current = new maplibregl.Map({
            container: mapContainerRef.current,
            style: `https://api.protomaps.com/styles/v5/dark/en.json?key=${protomapsKey}`,
            center: [0, 20],
            zoom: 1.5,
        });

        scaleRef.current = new maplibregl.ScaleControl({
            maxWidth: 120,
            unit: scaleUnit
        })
        mapRef.current.addControl(scaleRef.current, "bottom-left");

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
            scaleRef.current = null;
        };
    }, [scaleUnit]);

    return <div ref={mapContainerRef} style={{width: "100%", height: "100%"}} />;
}