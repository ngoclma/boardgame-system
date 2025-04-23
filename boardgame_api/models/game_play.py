from . import db
from datetime import datetime

class GamePlay(db.Model):
    __tablename__ = 'game_plays'
    
    play_id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.game_id'), nullable=False)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # in minutes
    mode = db.Column(db.String(255))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    results = db.relationship('PlayResult', backref='game_play', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'play_id': self.play_id,
            'game_id': self.game_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration': self.duration,
            'mode': self.mode,
            'notes': self.notes,
            'results': [result.to_dict() for result in self.results] if self.results else [],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }