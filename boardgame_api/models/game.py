from . import db
from datetime import datetime

class Game(db.Model):
    __tablename__ = 'games'
    
    game_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    min_players = db.Column(db.Integer)
    max_players = db.Column(db.Integer)
    avg_play_time = db.Column(db.Integer)
    image_url = db.Column(db.String(512))
    bgg_id = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    plays = db.relationship('GamePlay', backref='game', lazy=True)
    
    def to_dict(self):
        return {
            'game_id': self.game_id,
            'name': self.name,
            'description': self.description,
            'min_players': self.min_players,
            'max_players': self.max_players,
            'avg_play_time': self.avg_play_time,
            'image_url': self.image_url,
            'bgg_id': self.bgg_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }