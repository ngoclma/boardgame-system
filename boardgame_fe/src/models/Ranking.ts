export type RankingPeriod = 'all-time' | 'yearly' | 'monthly' | 'weekly';

export interface Ranking {
    rank: number;
    player_id: number;
    player_name: string;
    plays: number;
    victory_points: number;
    victory_rate: number;
}

export interface PlayerStats {
    player_id: number;
    name: string;
    overall: {
        total_plays: number;
        total_vps: number;
        victory_rate: number;
        rank?: number;
    };
    game_stats: {
        game_id: number;
        game_name: string;
        total_plays: number;
        total_vps: number;
        victory_rate: number;
    }[];
}