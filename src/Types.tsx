export type MapPoint = [number, number];
export type PlayingAreaMode = "idle" | "drawing" | "set";
export type MapInteractionMode = 
    | "idle" 
    | "drawing" 
    | "radar-picking-center"
    | "latitude-picking-point"
    | "longitude-picking-point";

export type RadarResult = "in" | "out";
export type LatitudeResult = "above" | "below";
export type LongitudeResult = "above" | "below";

export type RadarQuestion = {
    id: string;
    centerPoint: MapPoint;
    radiusKm: number;
    result: RadarResult;
}

export type LatitudeQuestion = {
    id: string;
    point: MapPoint;
    result: LatitudeResult;
}

export type LongitudeQuestion = {
    id: string;
    point: MapPoint;
    result: LongitudeResult;
}

export type QuestionFlow =
    | { kind: "closed" }
    | { kind: "menu" }
    | {
        kind: "radar";
        draft: {
            radiusText: string;
            result: RadarResult;
            centerPoint: MapPoint | null;
            editingRadarId: string | null;
        };
    }
    | {
        kind: "latitude";
        draft: {
            result: LatitudeResult;
            point: MapPoint | null;
            editingLatitudeId: string | null;
        };
    }
    | {
        kind: "longitude";
        draft: {
            result: LongitudeResult;
            point: MapPoint | null;
            editingLongitudeId: string | null;
        };
    };