from flask import Blueprint, request, jsonify
from extensions import db
from models.game import Game
from services.game_service import fetch_game_from_bgg, get_all_games, get_game_by_id

game_bp = Blueprint('game_bp', __name__)

@game_bp.route('/', methods=['GET'])
def get_games():
    """Get all games"""
    games = get_all_games()
    return jsonify([game.to_dict() for game in games])

@game_bp.route('/<int:game_id>', methods=['GET'])
def get_game(game_id):
    """Get a game by ID"""
    game = get_game_by_id(game_id)
    if not game:
        return jsonify({'error': 'Game not found'}), 404
    return jsonify(game.to_dict())

@game_bp.route('/', methods=['POST'])
def create_game():
    """Create a new game"""
    data = request.json
    
    # If BGG ID is provided, fetch data from BGG API
    if 'bgg_id' in data and data['bgg_id']:
        bgg_data = fetch_game_from_bgg(data['bgg_id'])
        if bgg_data:
            data.update(bgg_data)
    
    game = Game(
        name=data.get('name'),
        description=data.get('description'),
        min_players=data.get('min_players'),
        max_players=data.get('max_players'),
        avg_play_time=data.get('avg_play_time'),
        image_url=data.get('image_url'),
        bgg_id=data.get('bgg_id')
    )
    
    db.session.add(game)
    db.session.commit()
    
    return jsonify(game.to_dict()), 201

@game_bp.route('/<int:game_id>', methods=['PUT'])
def update_game(game_id):
    """Update a game"""
    game = get_game_by_id(game_id)
    if not game:
        return jsonify({'error': 'Game not found'}), 404
    
    data = request.json
    
    game.name = data.get('name', game.name)
    game.description = data.get('description', game.description)
    game.min_players = data.get('min_players', game.min_players)
    game.max_players = data.get('max_players', game.max_players)
    game.avg_play_time = data.get('avg_play_time', game.avg_play_time)
    game.image_url = data.get('image_url', game.image_url)
    game.bgg_id = data.get('bgg_id', game.bgg_id)
    
    db.session.commit()
    
    return jsonify(game.to_dict())

@game_bp.route('/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    """Delete a game"""
    game = get_game_by_id(game_id)
    if not game:
        return jsonify({'error': 'Game not found'}), 404
    
    db.session.delete(game)
    db.session.commit()
    
    return jsonify({'message': 'Game deleted successfully'})