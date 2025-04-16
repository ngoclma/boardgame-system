from models.player import Player
from app import db

def get_all_players():
    """Get all players from database"""
    return Player.query.all()

def get_player_by_id(player_id):
    """Get a player by ID"""
    return Player.query.get(player_id)

# services/game_play_service.py
from models.game_play import GamePlay
from app import db

def get_all_game_plays():
    """Get all game plays from database"""
    return GamePlay.query.all()

def get_game_play_by_id(play_id):
    """Get a game play by ID"""
    return GamePlay.query.get(play_id)

def get_game_plays_by_game(game_id):
    """Get all game plays for a specific game"""
    return GamePlay.query.filter_by(game_id=game_id).all()

def get_game_plays_by_year(year):
    """Get all game plays for a specific year"""
    from sqlalchemy import extract
    return GamePlay.query.filter(extract('year', GamePlay.start_time) == year).all()
