export type MapPoint = [number, number];
export type PlayingAreaMode = "idle" | "drawing" | "set";
export type MapInteractionMode = "idle" | "drawing" | "radar-picking-center";

export type RadarResult = "in" | "out";

export type RadarQuestion = {
    id: string;
    centerPoint: MapPoint;
    radiusKm: number;
    result: RadarResult;
}

export type QuestionFlow = 
    | {kind: "closed"}
    | {kind: "menu"}
    | {
        kind: "radar";
        draft: {
            radiusKm: number;
            result: RadarResult;
            centerPoint: MapPoint | null;
            isPickingCenter: boolean;
        };
    };