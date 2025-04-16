from . import db
from datetime import datetime

class PlayResult(db.Model):
    __tablename__ = 'play_results'
    
    result_id = db.Column(db.Integer, primary_key=True)
    play_id = db.Column(db.Integer, db.ForeignKey('game_plays.play_id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('players.player_id'), nullable=False)
    score = db.Column(db.Integer)
    rank = db.Column(db.Integer)
    victory_points = db.Column(db.Numeric(5, 2))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'result_id': self.result_id,
            'play_id': self.play_id,
            'player_id': self.player_id,
            'score': self.score,
            'rank': self.rank,
            'victory_points': float(self.victory_points) if self.victory_points is not None else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }