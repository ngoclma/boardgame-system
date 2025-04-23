from app import create_app
from extensions import db
from models.game import Game
from services.game_service import fetch_game_from_bgg
import time

def update_games_from_bgg():
    """Update existing games with data from BoardGameGeek"""
    app = create_app()
    
    with app.app_context():
        # Get all games that have a BGG ID
        games = Game.query.filter(Game.bgg_id.isnot(None)).all()
        print(f"Found {len(games)} games with BGG IDs to update")
        
        updated_count = 0
        failed_count = 0
        
        for game in games:
            print(f"Updating {game.name} (BGG ID: {game.bgg_id})...")
            
            try:
                # Fetch data from BGG
                bgg_data = fetch_game_from_bgg(game.bgg_id)
                
                if bgg_data:
                    # Update game attributes
                    game.description = bgg_data['description'] or game.description
                    game.min_players = bgg_data['min_players'] or game.min_players
                    game.max_players = bgg_data['max_players'] or game.max_players
                    game.avg_play_time = bgg_data['avg_play_time'] or game.avg_play_time
                    game.image_url = bgg_data['image_url'] or game.image_url
                    
                    db.session.add(game)
                    updated_count += 1
                    print(f"Successfully updated {game.name}")
                else:
                    failed_count += 1
                    print(f"Failed to fetch data for {game.name}")
                
                # Sleep to avoid hitting BGG API rate limits
                time.sleep(2)
                
            except Exception as e:
                failed_count += 1
                print(f"Error updating {game.name}: {str(e)}")
                continue
        
        try:
            db.session.commit()
            print(f"\nUpdate complete!")
            print(f"Successfully updated: {updated_count} games")
            print(f"Failed to update: {failed_count} games")
        except Exception as e:
            db.session.rollback()
            print(f"Error saving updates to database: {str(e)}")

if __name__ == "__main__":
    update_games_from_bgg()