export type MapPoint = [number, number];
export type PlayingAreaMode = "idle" | "drawing" | "set";
export type RadarResult = "in" | "out";
export type QuestionFlow = 
    | {kind: "closed"}
    | {kind: "menu"}
    | {
        kind: "radar";
        draft: {
            radius: number;
            result: RadarResult;
            centerPoint: MapPoint | null;
            isPickingCenter: boolean;
        };
    };