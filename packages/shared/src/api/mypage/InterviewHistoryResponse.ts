import { EnumResponse } from "../EnumResponse";

export interface ScoreItem {
    interviewId: number;
    title: string;
    track: EnumResponse;
    score: number;
    endedAt: string;
}

export interface ScoreSection {
    scoreHistory: ScoreItem[];
}

export interface HistoryItem {
    interviewId: number;
    title: string;
    questionCount: number;
    status: EnumResponse;
    endReason: EnumResponse;
    track: EnumResponse;
    score?: number;
    createdAt: string;
}

export interface HistorySection {
    historyItems: HistoryItem[];
}

export interface  weakPointList {
    label : string,
    message : string,
    averageScore : number
}

export interface weakPoints {
    weakPointList: weakPointList[];
}

export interface GrowthSectionProps {
    scoreSection: ScoreSection;
    historySection: HistorySection;
    weakPoints : weakPoints;
    number: number;
    totalPages: number;
    totalElements: number;
}