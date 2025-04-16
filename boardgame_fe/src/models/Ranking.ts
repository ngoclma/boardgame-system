export interface PlayerRanking {
    rank: number;
    player_id: number;
    name: string;
    total_plays: number;
    total_vps: number;
    victory_rate: number;
}

export interface GameRanking {
    game_id: number;
    game_name: string;
    rankings: PlayerRanking[];
}

export interface PlayerStats {
    player_id: number;
    name: string;
    alias?: string;
    overall: {
        total_plays: number;
        total_vps: number;
        victory_rate: number;
        rank?: number;
    };
    yearly_stats: {
        [year: number]: {
            total_plays: number;
            total_vps: number;
            victory_rate: number;
            rank?: number;
        };
    };
    game_stats: {
        game_id: number;
        game_name: string;
        total_plays: number;
        total_vps: number;
        victory_rate: number;
    }[];
}