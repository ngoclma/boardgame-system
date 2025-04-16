from extensions import db
from models.game_play import GamePlay
from models.play_result import PlayResult
from datetime import datetime

def get_all_game_plays():
    """Get all game plays with their results"""
    return GamePlay.query.all()

def get_game_play_by_id(play_id):
    """Get a specific game play by ID"""
    return GamePlay.query.get(play_id)

def create_game_play(data):
    """Create a new game play with results"""
    # Parse dates
    start_time = datetime.fromisoformat(data.get('start_time')) if data.get('start_time') else None
    end_time = datetime.fromisoformat(data.get('end_time')) if data.get('end_time') else None
    
    # Calculate duration if not provided
    duration = data.get('duration')
    if not duration and start_time and end_time:
        duration = int((end_time - start_time).total_seconds() / 60)
    
    game_play = GamePlay(
        game_id=data.get('game_id'),
        start_time=start_time,
        end_time=end_time,
        duration=duration,
        mode=data.get('mode'),
        notes=data.get('notes')
    )
    
    db.session.add(game_play)
    return game_play

def update_game_play(game_play, data):
    """Update an existing game play"""
    # Parse dates
    if 'start_time' in data:
        game_play.start_time = datetime.fromisoformat(data['start_time'])
    if 'end_time' in data:
        game_play.end_time = datetime.fromisoformat(data['end_time'])
    
    # Update basic fields
    game_play.game_id = data.get('game_id', game_play.game_id)
    game_play.duration = data.get('duration', game_play.duration)
    game_play.mode = data.get('mode', game_play.mode)
    game_play.notes = data.get('notes', game_play.notes)
    
    # Calculate duration if not provided
    if not game_play.duration and game_play.start_time and game_play.end_time:
        game_play.duration = int((game_play.end_time - game_play.start_time).total_seconds() / 60)
    
    return game_play

def delete_game_play(game_play):
    """Delete a game play and its results"""
    db.session.delete(game_play)
    db.session.commit()

def create_play_result(play_id, result_data, victory_points):
    """Create a new play result"""
    result = PlayResult(
        play_id=play_id,
        player_id=result_data.get('player_id'),
        score=result_data.get('score'),
        rank=result_data.get('rank'),
        victory_points=victory_points,
        notes=result_data.get('notes')
    )
    db.session.add(result)
    return result

def get_player_game_plays(player_id):
    """Get all game plays for a specific player"""
    return GamePlay.query.join(PlayResult).filter(PlayResult.player_id == player_id).all()

def get_game_plays_by_game(game_id):
    """Get all game plays for a specific game"""
    return GamePlay.query.filter_by(game_id=game_id).all()

def get_recent_game_plays(limit=5):
    """Get recent game plays, ordered by creation date"""
    return GamePlay.query.order_by(GamePlay.created_at.desc()).limit(limit).all()

def get_game_play_statistics():
    """Get basic statistics about game plays"""
    total_plays = GamePlay.query.count()
    total_games_played = db.session.query(db.func.count(db.distinct(GamePlay.game_id))).scalar()
    avg_duration = db.session.query(db.func.avg(GamePlay.duration)).scalar()
    
    return {
        'total_plays': total_plays,
        'total_games_played': total_games_played,
        'average_duration': round(avg_duration) if avg_duration else 0
    }