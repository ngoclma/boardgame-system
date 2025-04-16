// export interface Game {
//     game_id: number;
//     name: string;
//     description?: string;
//     min_players?: number;
//     max_players?: number;
//     avg_play_time?: number;
//     image_url?: string;
//     bgg_id?: number;
//     created_at?: string;
// }

export interface Game {
    game_id: number;
    name: string;
    description?: string;
    image_url?: string;
    min_players?: number;
    max_players?: number;
    min_playtime?: number;
    max_playtime?: number;
    publisher: string;
    year_published: number;
    bgg_id?: number;
    complexity?: number;
    category?: string[];
    mechanics?: string[];
    designers?: string[];
}