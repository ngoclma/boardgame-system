from flask import Blueprint, request, jsonify
from models.player import Player
from models.game import Game
from services.ranking_service import (
    get_player_overall_ranking,
    get_player_yearly_ranking,
    get_player_game_ranking,
    get_game_ranking,
    get_player_stats
)

ranking_bp = Blueprint('ranking_bp', __name__)

@ranking_bp.route('/overall', methods=['GET'])
def get_overall_ranking():
    """Get overall player ranking"""
    rankings = get_player_overall_ranking()
    return jsonify(rankings)

@ranking_bp.route('/yearly/<int:year>', methods=['GET'])
def get_yearly_ranking(year):
    """Get yearly player ranking"""
    rankings = get_player_yearly_ranking(year)
    return jsonify(rankings)

@ranking_bp.route('/games/<int:game_id>', methods=['GET'])
def get_game_player_ranking(game_id):
    """Get player ranking for a specific game"""
    rankings = get_game_ranking(game_id)
    return jsonify(rankings)

@ranking_bp.route('/players/<int:player_id>', methods=['GET'])
def get_player_stats_endpoint(player_id):
    """Get stats for a specific player"""
    stats = get_player_stats(player_id)
    return jsonify(stats)