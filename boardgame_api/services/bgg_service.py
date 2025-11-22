import requests
import xml.etree.ElementTree as ET
import os
from models.game import Game
from extensions import db
from datetime import datetime
from services.game_service import fetch_game_from_bgg
import time

def import_bgg_collection(username):
    url = f'https://boardgamegeek.com/xmlapi2/collection?username={username}'

    # Include BGG token in request headers if provided via environment
    headers = {}
    bgg_token = os.getenv('BGG_TOKEN')
    if not bgg_token:
        raise Exception('BGG_TOKEN environment variable not set. Create a token at https://boardgamegeek.com/applications and set BGG_TOKEN.')
    # BGG requires Authorization: Bearer <token>
    headers['Authorization'] = f'Bearer {bgg_token}'

    # Use a timeout and return more helpful errors for auth failures / HTTP issues
    try:
        response = requests.get(url, headers=headers, timeout=10)
    except requests.RequestException as e:
        raise Exception(f'Failed to fetch BGG collection: {str(e)}')

    # Explicitly surface authentication failures
    if response.status_code == 401:
        www = response.headers.get('www-authenticate')
        raise Exception(f'BGG authentication failed (401). WWW-Authenticate: {www}')

    if response.status_code != 200:
        body = response.text or ''
        raise Exception(f'Failed to fetch BGG collection: status={response.status_code} body={body[:500]}')
    
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
                complexity=bgg_data['averageweight'],
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