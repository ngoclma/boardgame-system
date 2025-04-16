from flask import Blueprint, request, jsonify
from extensions import db
from models.game_play import GamePlay
from models.play_result import PlayResult
from services.game_play_service import get_all_game_plays, get_game_play_by_id
from services.ranking_service import calculate_victory_points
from datetime import datetime

game_play_bp = Blueprint('game_play_bp', __name__)

@game_play_bp.route('/', methods=['GET'])
def get_game_plays():
    """Get all game plays"""
    game_plays = get_all_game_plays()
    return jsonify([game_play.to_dict() for game_play in game_plays])

@game_play_bp.route('/<int:play_id>', methods=['GET'])
def get_game_play(play_id):
    """Get a game play by ID"""
    game_play = get_game_play_by_id(play_id)
    if not game_play:
        return jsonify({'error': 'Game play not found'}), 404
    
    # Get results for this game play
    results = [result.to_dict() for result in game_play.results]
    
    response = game_play.to_dict()
    response['results'] = results
    
    return jsonify(response)

@game_play_bp.route('/', methods=['POST'])
def create_game_play():
    """Create a new game play with results"""
    data = request.json
    
    # Parse dates
    start_time = datetime.fromisoformat(data.get('start_time')) if data.get('start_time') else None
    end_time = datetime.fromisoformat(data.get('end_time')) if data.get('end_time') else None
    
    game_play = GamePlay(
        game_id=data.get('game_id'),
        start_time=start_time,
        end_time=end_time,
        duration=data.get('duration'),
        mode=data.get('mode'),
        notes=data.get('notes')
    )
    
    db.session.add(game_play)
    db.session.flush()  # Get the ID without committing
    
    # Add results
    results_data = data.get('results', [])
    
    # Calculate victory points based on rankings
    player_ranks = [(result.get('player_id'), result.get('rank')) for result in results_data]
    victory_points_map = calculate_victory_points(player_ranks)
    
    results = []
    for result_data in results_data:
        player_id = result_data.get('player_id')
        result = PlayResult(
            play_id=game_play.play_id,
            player_id=player_id,
            score=result_data.get('score'),
            rank=result_data.get('rank'),
            victory_points=victory_points_map.get(player_id, 0),
            notes=result_data.get('notes')
        )
        db.session.add(result)
        results.append(result)
    
    db.session.commit()
    
    response = game_play.to_dict()
    response['results'] = [result.to_dict() for result in results]
    
    return jsonify(response), 201

@game_play_bp.route('/<int:play_id>', methods=['PUT'])
def update_game_play(play_id):
    """Update a game play"""
    game_play = get_game_play_by_id(play_id)
    if not game_play:
        return jsonify({'error': 'Game play not found'}), 404
    
    data = request.json
    
    # Parse dates
    start_time = datetime.fromisoformat(data.get('start_time')) if data.get('start_time') else game_play.start_time
    end_time = datetime.fromisoformat(data.get('end_time')) if data.get('end_time') else game_play.end_time
    
    game_play.game_id = data.get('game_id', game_play.game_id)
    game_play.start_time = start_time
    game_play.end_time = end_time
    game_play.duration = data.get('duration', game_play.duration)
    game_play.mode = data.get('mode', game_play.mode)
    game_play.notes = data.get('notes', game_play.notes)
    
    # Update results if provided
    if 'results' in data:
        # Delete existing results
        for result in game_play.results:
            db.session.delete(result)
        
        # Add new results
        results_data = data.get('results', [])
        
        # Calculate victory points based on rankings
        player_ranks = [(result.get('player_id'), result.get('rank')) for result in results_data]
        victory_points_map = calculate_victory_points(player_ranks)
        
        results = []
        for result_data in results_data:
            player_id = result_data.get('player_id')
            result = PlayResult(
                play_id=game_play.play_id,
                player_id=player_id,
                score=result_data.get('score'),
                rank=result_data.get('rank'),
                victory_points=victory_points_map.get(player_id, 0),
                notes=result_data.get('notes')
            )
            db.session.add(result)
            results.append(result)
    
    db.session.commit()
    
    response = game_play.to_dict()
    response['results'] = [result.to_dict() for result in game_play.results]
    
    return jsonify(response)

@game_play_bp.route('/<int:play_id>', methods=['DELETE'])
def delete_game_play(play_id):
    """Delete a game play"""
    game_play = get_game_play_by_id(play_id)
    if not game_play:
        return jsonify({'error': 'Game play not found'}), 404
    
    db.session.delete(game_play)
    db.session.commit()
    
    return jsonify({'message': 'Game play deleted successfully'})