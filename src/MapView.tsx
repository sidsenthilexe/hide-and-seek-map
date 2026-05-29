import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {
    const  mapContainerRef = useRef<HTMLDivElement | null> (null);
    const mapRef = useRef<Map | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;
        mapRef.current = new maplibregl.Map({
            container: mapContainerRef.current,
            style: "https://demotiles.maplibre.org/style.json",
            center: [0, 20],
            zoom: 1.5,
        });

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    return <div ref={mapContainerRef} style={{width: "100%", height: "100%"}} />;
}