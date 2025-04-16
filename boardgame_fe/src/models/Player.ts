// export interface Player {
//     player_id: number;
//     name: string;
//     alias?: string;
//     created_at?: string;
//   }

export interface Player {
    player_id: number;
    name: string;
    alias?: string;
    no_total_wins: number;
    no_total_play: number;
    total_victory_points: number;
    victory_rate: number;
}