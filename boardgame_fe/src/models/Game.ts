export interface Game {
    game_id: number;
    name: string;
    description?: string;
    release_year: number;
    publisher?: string;
    min_players?: number;
    max_players?: number;
    avg_play_time: number;
    image_url?: string;
    bgg_id?: number;
    comments?: string;
    complexity: number;
    created_at?: string;
}