import requests
import xml.etree.ElementTree as ET
from models.game import Game
from extensions import db
from datetime import datetime
from services.game_service import fetch_game_from_bgg
import time

def import_bgg_collection(username):
    url = f'https://boardgamegeek.com/xmlapi2/collection?username={username}'
    response = requests.get(url)
    
    if response.status_code != 200:
        raise Exception('Failed to fetch BGG collection')
    
    root = ET.fromstring(response.content)
    added_games = []
    errors = []
    
    for item in root.findall('item'):
        try:
            bgg_id = int(item.get('objectid'))
            
            # Check if game already exists
            existing_game = Game.query.filter_by(bgg_id=bgg_id).first()
            if existing_game:
                continue
            
            # Fetch detailed game data from BGG API
            bgg_data = fetch_game_from_bgg(bgg_id)
            if not bgg_data:
                errors.append(f"Failed to fetch metadata for game ID: {bgg_id}")
                continue

            # Sleep to avoid hitting BGG API rate limits
            time.sleep(2)
            
            # Create new game with complete metadata
            game = Game(
                name=bgg_data['name'],
                bgg_id=bgg_id,
                description=bgg_data['description'],
                release_year=bgg_data['release_year'],
                min_players=bgg_data['min_players'],
                max_players=bgg_data['max_players'],
                avg_play_time=bgg_data['avg_play_time'],
                image_url=bgg_data['image_url'],
                created_at=datetime.utcnow()
            )
            
            db.session.add(game)
            added_games.append(game)
            print(f"Successfully imported {game.name} with metadata")
            
        except Exception as e:
            game_name = item.find('name').text if item.find('name') is not None else f"BGG ID: {bgg_id}"
            errors.append(f"Error importing {game_name}: {str(e)}")
            print(f"Failed to import {game_name}: {str(e)}")
    
    if added_games:
        try:
            db.session.commit()
            print(f"\nImport complete!")
            print(f"Successfully added: {len(added_games)} games")
            print(f"Errors encountered: {len(errors)}")
        except Exception as e:
            db.session.rollback()
            errors.append(f"Database error: {str(e)}")
            print(f"Error saving to database: {str(e)}")
    
    return added_games, errors