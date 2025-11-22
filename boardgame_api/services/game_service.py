import requests
import xml.etree.ElementTree as ET
import os
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
        release_year = item.find('.//yearpublished')
        averageweight = item.find('.//averageweight')
        
        return {
            'name': name.get('value') if name is not None else '',
            'description': description.text if description is not None else '',
            'min_players': int(min_players.get('value')) if min_players is not None else None,
            'max_players': int(max_players.get('value')) if max_players is not None else None,
            'avg_play_time': int(playing_time.get('value')) if playing_time is not None else None,
            'image_url': image.text if image is not None else '',
            'bgg_id': bgg_id,
            'release_year': int(release_year.get('value')) if release_year is not None else None,
            'averageweight': float(averageweight.get('value')) if averageweight is not None else None
        }
    except Exception as e:
        print(f"Error fetching data from BGG: {e}")
        return None