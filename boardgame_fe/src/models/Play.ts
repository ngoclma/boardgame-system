import { Game } from "./Game";
import { Player } from "./Player";

// export interface GamePlay {
//     play_id: number;
//     game_id: number;
//     start_time?: string;
//     end_time?: string;
//     duration?: number;
//     mode?: string;
//     notes?: string;
//     created_at?: string;
//     results?: PlayResult[];
//     game?: Game;
// }

// export interface PlayResult {
//     result_id?: number;
//     play_id: number;
//     player_id: number;
//     score?: number;
//     rank: number;
//     victory_points?: number;
//     notes?: string;
//     created_at?: string;
//     player?: Player;
// }

export interface Play {
    play_id: number;
    game_id: number;
    game_name?: string;
    start_time: string;
    end_time: string;
    duration: number;
    mode?: string;
    notes?: string;
    players: PlayResult[];
}

export interface PlayResult {
    play_id: number;
    player_id: number;
    player_name?: string;
    score: number;
    victory_points: number;
    notes?: string;
    rank: number;
}

export interface GameStats {
    game_id: number;
    game_name: string;
    play_count: number;
    avg_duration: number;
    last_played?: string;
}

export interface PlayerGameStats {
    game_id: number;
    game_name: string;
    plays: number;
    victory_points: number;
    victory_rate: number;
    best_rank: number;
    worst_rank: number;
    average_rank: number;
}

export interface Ranking {
    player_id: number;
    player_name: string;
    plays: number;
    victory_points: number;
    victory_rate: number;
    rank: number;
}

// Define period types for rankings
export type RankingPeriod = 'all-time' | 'yearly' | 'monthly';
export type RankingType = 'overall' | 'by-game';