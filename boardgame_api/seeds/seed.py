from app import create_app
from extensions import db
from models.game import Game
from models.player import Player
from models.game_play import GamePlay
from models.play_result import PlayResult
from datetime import datetime, timedelta

def seed_database():
    app = create_app()
    with app.app_context():
        # Clear existing data
        PlayResult.query.delete()
        GamePlay.query.delete()
        Player.query.delete()
        
        # Seed Players
        players = [
            Player(name="Le Minh Anh Ngoc", alias="Ngoc"),
            Player(name="Truong Vinh Hien", alias="Hien"),
            Player(name="Nguyen Cao Thien Phuc", alias="Phuc"),
            Player(name="Tran Quang Dung", alias="Dung")
        ]
        
        for player in players:
            db.session.add(player)
        db.session.commit()
        
        # Seed Game Plays
        game_plays = [
            GamePlay(
                game_id=97,
                start_time="2025-02-23 20:50:00",
                end_time="2025-02-23 22:30:00",
                mode="Standard",
            ),
            GamePlay(
                game_id=100,
                start_time="2024-04-21 21:10:00",
                end_time="2024-04-21 23:50:00",
                mode="2 Vortex + All modules + Cosmic Twilight Events",
            ),
        ]
        
        for play in game_plays:
            db.session.add(play)
        db.session.commit()
        
        # Seed Play Results
        results = [
            # Acquire game results
            PlayResult(play_id=game_plays[0].play_id, player_id=players[0].player_id, score=335, rank=3),
            PlayResult(play_id=game_plays[0].play_id, player_id=players[1].player_id, score=341, rank=2),
            PlayResult(play_id=game_plays[0].play_id, player_id=players[2].player_id, score=499, rank=1),
            PlayResult(play_id=game_plays[0].play_id, player_id=players[3].player_id, score=293, rank=4),
            
            # Andromeda Edge results
            PlayResult(play_id=game_plays[1].play_id, player_id=players[0].player_id, score=119, rank=4, notes="Mecharon Sythborn"),
            PlayResult(play_id=game_plays[1].play_id, player_id=players[1].player_id, score=167, rank=1, notes="Zoldian Warmongers"),
            PlayResult(play_id=game_plays[1].play_id, player_id=players[2].player_id, score=143, rank=3, notes="Wolfguardian Howlers"),
            PlayResult(play_id=game_plays[1].play_id, player_id=players[3].player_id, score=154, rank=2, notes="Funginar Sporegots"),            
        ]
        
        for result in results:
            db.session.add(result)
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()