import { useEffect, useMemo, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type ScaleUnit = "metric" | "imperial";
type MapMode = "idle" | "drawing" | "set";
type MapPoint = [number, number];

type MapViewProps = {
    scaleUnit: ScaleUnit;
    mode: MapMode;
    drawingPoints: MapPoint[];
    playingArea: GeoJSON.Polygon | null;
    onMapClick: (point: MapPoint) => void;
    onFirstPointClick: () => void;
}

const SOURCE_PLAYING_AREA = "playing-area";
const SOURCE_DRAWING_LINE = "drawing-line";
const SOURCE_DRAWING_POINTS = "drawing-points";

const LAYER_PLAYING_FILL = "playing-area-fill";
const LAYER_PLAYING_OUTLINE = "playing-area-outline";
const LAYER_DRAWING_LINE = "drawing-line-layer";
const LAYER_DRAWING_POINTS =  "drawing-points-layer";
const TOLERANCE = 0.001;
const PX_TOLERANCE = 20;

function lineFromPoints(points: MapPoint[]): GeoJSON.Feature<GeoJSON.LineString> {
    return {
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: points,
        },
    };
}

function collectionFromPoints(points: MapPoint[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
    return {
        type: "FeatureCollection",
        features: points.map((point) => ({
            type: "Feature",
            properties: {},
            geometry: {
                type: "Point",
                coordinates: point,
            },
        })),
    };
}

function featureFromPolygon(polygon: GeoJSON.Polygon | null) : GeoJSON.Feature<GeoJSON.Polygon> | null {
    if (!polygon) return null;
    return {
        type: "Feature",
        properties: {},
        geometry: polygon,
    };
}

export default function MapView({
    scaleUnit,
    mode,
    drawingPoints,
    playingArea,
    onMapClick,
    onFirstPointClick,
}: MapViewProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef =useRef<Map | null>(null);
    const protomapsKey = import.meta.env.VITE_PROTOMAPS_KEY;
    const scaleRef =  useRef<maplibregl.ScaleControl | null>(null);

    const drawingLineData = useMemo(() => {
        if(drawingPoints.length< 2)return null;
        return lineFromPoints(drawingPoints);
    }, [drawingPoints]);

    const drawingPointData = useMemo(() => {
        if(drawingPoints.length === 0) return null;
        return collectionFromPoints(drawingPoints);
    }, [drawingPoints]);

    const playingAreaFeature =  useMemo(() => featureFromPolygon(playingArea), [playingArea]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: `https://api.protomaps.com/styles/v5/dark/en.json?key=${protomapsKey}`,
            center: [0, 20],
            zoom: 1.5,
        });

        mapRef.current = map;

        const addSourcesAndLayers = () => {
            if(!map.getSource(SOURCE_PLAYING_AREA)) {
                map.addSource(SOURCE_PLAYING_AREA, {
                    type: "geojson",
                    data:
                        playingAreaFeature ??
                        ({
                            type:  "Feature",
                            properties: {},
                            geometry: {
                                type: "Polygon",
                                coordinates: [[[0, 0]]],
                            },
                        } as GeoJSON.Feature<GeoJSON.Polygon>),
                });
            }

            if (!map.getSource(SOURCE_DRAWING_LINE)) {
                map.addSource(SOURCE_DRAWING_LINE, {
                    type: "geojson",
                    data:
                        drawingLineData ??
                        ({
                            type: "Feature",
                            properties: {},
                            geometry:  {
                                type: "LineString",
                                coordinates: [[0, 0], [0, 0]],
                            },
                        } as GeoJSON.Feature<GeoJSON.LineString>),
                });
            }

            if (!map.getSource(SOURCE_DRAWING_POINTS)) {
                map.addSource(SOURCE_DRAWING_POINTS, {
                    type: "geojson",
                    data:
                        drawingPointData ??
                        ({
                            type: "FeatureCollection",
                            features: [],
                        } as GeoJSON.FeatureCollection<GeoJSON.Point>),
                });
            }

            if (!map.getLayer(LAYER_PLAYING_FILL)) {
                map.addLayer({
                    id: LAYER_PLAYING_FILL,
                    type: "fill",
                    source: SOURCE_PLAYING_AREA,
                    paint: {
                        "fill-color": "lightblue",
                        "fill-opacity": 0.2,
                    },
                });
            }

            if (!map.getLayer(LAYER_PLAYING_OUTLINE)) {
                map.addLayer({
                    id: LAYER_PLAYING_OUTLINE,
                    type: "line",
                    source: SOURCE_PLAYING_AREA,
                    paint: {
                        "line-color": "lightblue",
                        "line-width": 3,
                    }
                })
            }

            if (!map.getLayer(LAYER_DRAWING_LINE)) {
                map.addLayer({
                    id: LAYER_DRAWING_LINE,
                    type: "line",
                    source: SOURCE_DRAWING_LINE,
                    paint:{
                        "line-color": "orange",
                        "line-width": 3,
                        "line-dasharray": [2,1],
                    },
                });
            }

            if  (!map.getLayer(LAYER_DRAWING_POINTS)) {
                map.addLayer({
                    id: LAYER_DRAWING_POINTS,
                    type: "circle",
                    source: SOURCE_DRAWING_POINTS,
                    paint: {
                        "circle-radius" : 5,
                        "circle-color" : "orange",
                        "circle-stroke-width":  2,
                        "circle-stroke-color": "black",
                    },
                });
            }
        };

        if(map.isStyleLoaded()) {
            addSourcesAndLayers();
        } else {
            map.on("load",  addSourcesAndLayers);
        }

        scaleRef.current = new maplibregl.ScaleControl({
            maxWidth: 120,
            unit: scaleUnit,
        });
        map.addControl(scaleRef.current, "bottom-left");

        if (map.getLayer(LAYER_DRAWING_LINE)) {
            map.setLayoutProperty(
                LAYER_DRAWING_LINE,
                "visibility",
                mode === "drawing" ? "visible" : "none"
            );
        }

        if (map.getLayer(LAYER_DRAWING_POINTS)) {
            map.setLayoutProperty(
                LAYER_DRAWING_POINTS,
                "visibility",
                mode === "drawing" ? "visible" : "none"
            );
        }

        return () => {
            map.remove();
            mapRef.current = null;
            scaleRef.current = null;
        };
    }, []);

     useEffect(() => {
            if (!mapRef.current) return;

            const map = mapRef.current;
            const onClick = (event: maplibregl.MapMouseEvent) => {
                if (mode !== "drawing") return;
                onMapClick([event.lngLat.lng, event.lngLat.lat]);
            };

            map.on("click", onClick);
            return () => {
                map.off("click", onClick);
            };
        }, [mode, onMapClick]);  
        
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        const onPointClick = (event: maplibregl.MapLayerMouseEvent) => {
            if (mode !== "drawing" || drawingPoints.length < 3) return;
            const feature = event.features?.[0];
            if (!feature || feature.geometry.type !== "Point") return;

            const [firstLng, firstLat] = drawingPoints[0];
            const firstPos = map.project([firstLng, firstLat]);
            const clickPos = event.point;

            const dist = Math.sqrt(
                Math.pow(firstPos.x - clickPos.x, 2) +
                Math.pow(firstPos.y - clickPos.y, 2)
            );


            if (dist < PX_TOLERANCE) {
                onFirstPointClick();
            }
        };

        map.on("click", LAYER_DRAWING_POINTS, onPointClick);
        return () => {
            map.off("click", LAYER_DRAWING_POINTS, onPointClick);
        };
    }, [mode, drawingPoints, onFirstPointClick]);

    useEffect(() => {
        if (!mapRef.current) return;
        if (scaleRef.current) {
            scaleRef.current.setUnit(scaleUnit);
        }
    }, [scaleUnit]);

    useEffect(() => {
        if (!mapRef.current ||  !mapRef.current.isStyleLoaded())  return;
        const map = mapRef.current;

        if (mode === "drawing") {
            map.getCanvas().style.cursor= "crosshair";
        } else {
            map.getCanvas().style.cursor= "";
        }

        const playingAreaSource = map.getSource(SOURCE_PLAYING_AREA) as maplibregl.GeoJSONSource | undefined;
        const drawingLineSource = map.getSource(SOURCE_DRAWING_LINE) as maplibregl.GeoJSONSource | undefined;
        const drawingPointsSource = map.getSource(SOURCE_DRAWING_POINTS) as maplibregl.GeoJSONSource | undefined;

        if (playingAreaSource) {
            playingAreaSource.setData(
                playingAreaFeature  ??
                    ({
                        type: "Feature",
                        properties: {},
                        geometry:{
                            type: "Polygon",
                            coordinates:[[[0,0]]],
                        },
                    } as GeoJSON.Feature<GeoJSON.Polygon>)
            );
        }

        if (drawingLineSource) {
            drawingLineSource.setData(
                drawingLineData ??
                    ({
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: [[0,0], [0,0]],
                        },
                    } as GeoJSON.Feature<GeoJSON.LineString>)
            );
        }

        if (drawingPointsSource) {
            drawingPointsSource.setData(
                drawingPointData ??
                    ({
                        type: "FeatureCollection",
                        features: [],
                    } as GeoJSON.FeatureCollection<GeoJSON.Point>)
            );
        }

    }, [mode, drawingPoints, playingAreaFeature, drawingLineData, drawingPointData]);

    return  <div ref={mapContainerRef} style={{width: "100%", height: "100%"}} />
}