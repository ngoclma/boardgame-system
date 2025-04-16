from models.player import Player
from models.game import Game
from models.game_play import GamePlay
from models.play_result import PlayResult
from sqlalchemy import func, extract
from app import db
from decimal import Decimal
import math

def calculate_victory_points(player_ranks):
    """
    Calculate victory points based on player rankings
    
    For each game play, we take the number of players, and half of them (round up) 
    will be assigned victory points.
    
    1st place: 1 point
    2nd place: 1/2 point
    3rd place: 1/4 point
    4th & 5th place (in a 5-player game): 0 point
    """
    # Sort by rank
    sorted_players = sorted(player_ranks, key=lambda x: x[1])
    
    # Total number of players
    total_players = len(sorted_players)
    
    # Number of players that get points (half rounded up)
    players_with_points = math.ceil(total_players / 2.0)
    
    # Calculate points
    vp_map = {}
    
    current_rank = None
    current_vp = None
    
    for i, (player_id, rank) in enumerate(sorted_players):
        # If tied (same rank), give the same points
        if rank != current_rank:
            current_rank = rank
            current_vp = 1.0 / (i + 1) if i < players_with_points else 0
        
        vp_map[player_id] = Decimal(str(current_vp))
    
    return vp_map

def get_player_overall_ranking():
    """Get overall player ranking based on victory rate"""
    # Subquery to get total number of plays for each player
    plays_subquery = db.session.query(
        PlayResult.player_id,
        func.count(PlayResult.play_id.distinct()).label('total_plays')
    ).group_by(PlayResult.player_id).subquery()
    
    # Query for victory points and join with plays count
    results = db.session.query(
        Player.player_id,
        Player.name,
        func.sum(PlayResult.victory_points).label('total_vps'),
        plays_subquery.c.total_plays,
        (func.sum(PlayResult.victory_points) / plays_subquery.c.total_plays).label('victory_rate')
    ).join(
        PlayResult, Player.player_id == PlayResult.player_id
    ).join(
        plays_subquery, Player.player_id == plays_subquery.c.player_id
    ).group_by(
        Player.player_id, Player.name, plays_subquery.c.total_plays
    ).order_by(
        func.sum(PlayResult.victory_points) / plays_subquery.c.total_plays.desc()
    ).all()
    
    rankings = []
    for i, result in enumerate(results):
        rankings.append({
            'rank': i + 1,
            'player_id': result.player_id,
            'name': result.name,
            'total_plays': result.total_plays,
            'total_vps': float(result.total_vps),
            'victory_rate': float(result.victory_rate)
        })
    
    return rankings

def get_player_yearly_ranking(year):
    """Get yearly player ranking based on victory rate"""
    # Subquery to get game plays for the specified year
    year_plays_subquery = db.session.query(
        GamePlay.play_id
    ).filter(
        extract('year', GamePlay.start_time) == year
    ).subquery()
    
    # Subquery to get total number of plays for each player in the specified year
    plays_subquery = db.session.query(
        PlayResult.player_id,
        func.count(PlayResult.play_id.distinct()).label('total_plays')
    ).filter(
        PlayResult.play_id.in_(db.session.query(year_plays_subquery.c.play_id))
    ).group_by(PlayResult.player_id).subquery()
    
    # Query for victory points and join with plays count
    results = db.session.query(
        Player.player_id,
        Player.name,
        func.sum(PlayResult.victory_points).label('total_vps'),
        plays_subquery.c.total_plays,
        (func.sum(PlayResult.victory_points) / plays_subquery.c.total_plays).label('victory_rate')
    ).join(
        PlayResult, Player.player_id == PlayResult.player_id
    ).filter(
        PlayResult.play_id.in_(db.session.query(year_plays_subquery.c.play_id))
    ).join(
        plays_subquery, Player.player_id == plays_subquery.c.player_id
    ).group_by(
        Player.player_id, Player.name, plays_subquery.c.total_plays
    ).order_by(
        func.sum(PlayResult.victory_points) / plays_subquery.c.total_plays.desc()
    ).all()
    
    rankings = []
    for i, result in enumerate(results):
        rankings.append({
            'rank': i + 1,
            'player_id': result.player_id,
            'name': result.name,
            'total_plays': result.total_plays,
            'total_vps': float(result.total_vps),
            'victory_rate': float(result.victory_rate)
        })
    
    return rankings

def get_game_ranking(game_id):
    """Get player ranking for a specific game"""
    # Subquery to get game plays for the specified game
    game_plays_subquery = db.session.query(
        GamePlay.play_id
    ).filter(
        GamePlay.game_id == game_id
    ).subquery()
    
    # Subquery to get total number of plays for each player in the specified game
    plays_subquery = db.session.query(
        PlayResult.player_id,
        func.count(PlayResult.play_id.distinct()).label('total_plays')
    ).filter(
        PlayResult.play_id.in_(db.session.query(game_plays_subquery.c.play_id))
    ).group_by(PlayResult.player_id).subquery()
    
    # Query for victory points and join with plays count
    results = db.session.query(
        Player.player_id,
        Player.name,
        func.sum(PlayResult.victory_points).label('total_vps'),
        plays_subquery.c.total_plays,
        (func.sum(PlayResult.victory_points) / plays_subquery.c.total_plays).label('victory_rate')
    ).join(
        PlayResult, Player.player_id == PlayResult.player_id
    ).filter(
        PlayResult.play_id.in_(db.session.query(game_plays_subquery.c.play_id))
    ).join(
        plays_subquery, Player.player_id == plays_subquery.c.player_id
    ).group_by(
        Player.player_id, Player.name, plays_subquery.c.total_plays
    ).order_by(
        func.sum(PlayResult.victory_points) / plays_subquery.c.total_plays.desc()
    ).all()
    
    # Get the game name
    game = Game.query.get(game_id)
    game_name = game.name if game else "Unknown Game"
    
    rankings = []
    for i, result in enumerate(results):
        rankings.append({
            'rank': i + 1,
            'player_id': result.player_id,
            'name': result.name,
            'total_plays': result.total_plays,
            'total_vps': float(result.total_vps),
            'victory_rate': float(result.victory_rate)
        })
    
    return {
        'game_id': game_id,
        'game_name': game_name,
        'rankings': rankings
    }

def get_player_game_ranking(player_id):
    """Get a player's performance across all games"""
    # Subquery to get total number of plays for each game by this player
    plays_subquery = db.session.query(
        GamePlay.game_id,
        func.count(PlayResult.play_id.distinct()).label('total_plays')
    ).join(
        PlayResult, GamePlay.play_id == PlayResult.play_id
    ).filter(
        PlayResult.player_id == player_id
    ).group_by(GamePlay.game_id).subquery()
    
    # Query for victory points per game
    results = db.session.query(
        Game.game_id,
        Game.name,
        func.sum(PlayResult.victory_points).label('total_vps'),
        plays_subquery.c.total_plays,
        (func.sum(PlayResult.victory_points) / plays_subquery.c.total_plays).label('victory_rate')
    ).join(
        GamePlay, Game.game_id == GamePlay.game_id
    ).join(
        PlayResult, GamePlay.play_id == PlayResult.play_id
    ).filter(
        PlayResult.player_id == player_id
    ).join(
        plays_subquery, Game.game_id == plays_subquery.c.game_id
    ).group_by(
        Game.game_id, Game.name, plays_subquery.c.total_plays
    ).order_by(
        func.sum(PlayResult.victory_points) / plays_subquery.c.total_plays.desc()
    ).all()
    
    game_rankings = []
    for result in results:
        game_rankings.append({
            'game_id': result.game_id,
            'game_name': result.name,
            'total_plays': result.total_plays,
            'total_vps': float(result.total_vps),
            'victory_rate': float(result.victory_rate)
        })
    
    return game_rankings

def get_player_stats(player_id):
    """Get comprehensive stats for a player"""
    player = Player.query.get(player_id)
    if not player:
        return {'error': 'Player not found'}
    
    # Get overall stats
    total_plays = db.session.query(func.count(PlayResult.play_id.distinct())).filter(
        PlayResult.player_id == player_id
    ).scalar() or 0
    
    total_vps = db.session.query(func.sum(PlayResult.victory_points)).filter(
        PlayResult.player_id == player_id
    ).scalar() or 0
    
    # Calculate victory rate
    victory_rate = float(total_vps) / total_plays if total_plays > 0 else 0
    
    # Get player's rank in overall ranking
    overall_ranking = get_player_overall_ranking()
    player_rank = next((r['rank'] for r in overall_ranking if r['player_id'] == player_id), None)
    
    # Get game-specific stats
    game_stats = get_player_game_ranking(player_id)
    
    # Get year-specific stats
    current_year = 2025  # This should be dynamically determined
    years = range(2023, current_year + 1)  # Adjust the range as needed
    yearly_stats = {}
    
    for year in years:
        year_plays = db.session.query(func.count(PlayResult.play_id.distinct())).join(
            GamePlay, PlayResult.play_id == GamePlay.play_id
        ).filter(
            PlayResult.player_id == player_id,
            extract('year', GamePlay.start_time) == year
        ).scalar() or 0
        
        if year_plays > 0:
            year_vps = db.session.query(func.sum(PlayResult.victory_points)).join(
                GamePlay, PlayResult.play_id == GamePlay.play_id
            ).filter(
                PlayResult.player_id == player_id,
                extract('year', GamePlay.start_time) == year
            ).scalar() or 0
            
            year_victory_rate = float(year_vps) / year_plays
            
            yearly_ranking = get_player_yearly_ranking(year)
            player_year_rank = next((r['rank'] for r in yearly_ranking if r['player_id'] == player_id), None)
            
            yearly_stats[year] = {
                'total_plays': year_plays,
                'total_vps': float(year_vps),
                'victory_rate': year_victory_rate,
                'rank': player_year_rank
            }
    
    return {
        'player_id': player.player_id,
        'name': player.name,
        'alias': player.alias,
        'overall': {
            'total_plays': total_plays,
            'total_vps': float(total_vps),
            'victory_rate': victory_rate,
            'rank': player_rank
        },
        'yearly_stats': yearly_stats,
        'game_stats': game_stats
    }