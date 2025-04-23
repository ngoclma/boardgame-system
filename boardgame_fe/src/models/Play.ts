import { Game } from "./Game";
import { Player } from "./Player";

export interface Play {
    play_id: number;
    game_id: number;
    start_time: string;
    end_time: string;
    duration?: number;
    mode?: string;
    notes?: string;
    created_at?: string;
    results: PlayResult[];
    game?: Game;
}

export interface PlayResult {
    result_id?: number;
    play_id?: number;
    player_id: number;
    score?: number;
    rank: number;
    victory_points?: number;
    notes?: string;
    created_at?: string;
    player?: Player;
}