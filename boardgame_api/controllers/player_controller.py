from flask import Blueprint, request, jsonify
from extensions import db
from models.player import Player
from services.player_service import get_all_players, get_player_by_id

player_bp = Blueprint('player_bp', __name__)

@player_bp.route('/', methods=['GET'])
def get_players():
    """Get all players"""
    players = get_all_players()
    return jsonify([player.to_dict() for player in players])

@player_bp.route('/<int:player_id>', methods=['GET'])
def get_player(player_id):
    """Get a player by ID"""
    player = get_player_by_id(player_id)
    if not player:
        return jsonify({'error': 'Player not found'}), 404
    return jsonify(player.to_dict())

@player_bp.route('/', methods=['POST'])
def create_player():
    """Create a new player"""
    data = request.json
    
    player = Player(
        name=data.get('name'),
        alias=data.get('alias')
    )
    
    db.session.add(player)
    db.session.commit()
    
    return jsonify(player.to_dict()), 201

@player_bp.route('/<int:player_id>', methods=['PUT'])
def update_player(player_id):
    """Update a player"""
    player = get_player_by_id(player_id)
    if not player:
        return jsonify({'error': 'Player not found'}), 404
    
    data = request.json
    
    player.name = data.get('name', player.name)
    player.alias = data.get('alias', player.alias)
    
    db.session.commit()
    
    return jsonify(player.to_dict())

@player_bp.route('/<int:player_id>', methods=['DELETE'])
def delete_player(player_id):
    """Delete a player"""
    player = get_player_by_id(player_id)
    if not player:
        return jsonify({'error': 'Player not found'}), 404
    
    db.session.delete(player)
    db.session.commit()
    
    return jsonify({'message': 'Player deleted successfully'})