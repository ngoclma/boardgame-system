import requests
import xml.etree.ElementTree as ET
from models.game import Game
from app import db

def get_all_games():
    """Get all games from database"""
    return Game.query.all()

def get_game_by_id(game_id):
    """Get a game by ID"""
    return Game.query.get(game_id)

def fetch_game_from_bgg(bgg_id):
    """Fetch game data from BoardGameGeek API"""
    try:
        url = f'https://boardgamegeek.com/xmlapi2/thing?id={bgg_id}&stats=1'
        response = requests.get(url)
        
        if response.status_code != 200:
            return None
        
        # Parse XML response
        root = ET.fromstring(response.content)
        item = root.find('.//item')
        
        if item is None:
            return None
        
        # Extract data
        name = item.find('.//name[@type="primary"]')
        description = item.find('.//description')
        min_players = item.find('.//minplayers')
        max_players = item.find('.//maxplayers')
        playing_time = item.find('.//playingtime')
        image = item.find('.//image')
        
        return {
            'name': name.get('value') if name is not None else '',
            'description': description.text if description is not None else '',
            'min_players': int(min_players.get('value')) if min_players is not None else None,
            'max_players': int(max_players.get('value')) if max_players is not None else None,
            'avg_play_time': int(playing_time.get('value')) if playing_time is not None else None,
            'image_url': image.text if image is not None else '',
            'bgg_id': bgg_id
        }
    except Exception as e:
        print(f"Error fetching data from BGG: {e}")
        return None