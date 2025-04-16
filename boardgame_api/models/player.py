from . import db
from datetime import datetime

class Player(db.Model):
    __tablename__ = 'players'
    
    player_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    alias = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    results = db.relationship('PlayResult', backref='player', lazy=True)
    
    def to_dict(self):
        return {
            'player_id': self.player_id,
            'name': self.name,
            'alias': self.alias,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }