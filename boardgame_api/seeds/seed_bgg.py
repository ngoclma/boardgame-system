from app import create_app
from extensions import db
from models.game import Game
import xml.etree.ElementTree as ET
from datetime import datetime

def parse_bgg_collection(xml_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()
    games = []
    
    for item in root.findall('item'):
        # Extract basic game info
        try:
            game_id = int(item.get('objectid'))
            name_elem = item.find('name')
            name = name_elem.text if name_elem is not None else "Unknown Game"
            year_elem = item.find('yearpublished')
            year = int(year_elem.text) if year_elem is not None and year_elem.text else None
            
            # Get image URLs
            image = item.find('image')
            image_url = image.text if image is not None else None
            thumbnail = item.find('thumbnail')
            thumbnail_url = thumbnail.text if thumbnail is not None else None
            
            # Get comment if available
            comment = item.find('comment')
            comment = comment.text if comment is not None else None
            
            # Get number of plays
            numplays = item.find('numplays')
            plays = int(numplays.text) if numplays is not None and numplays.text else 0
            
            game = {
                'name': name,
                'release_year': year,
                'image_url': image_url,
                'thumbnail_url': thumbnail_url,
                'bgg_id': game_id,
                'comment': comment,
                'created_at': datetime.utcnow()
            }
            games.append(game)
        except (ValueError, AttributeError) as e:
            print(f"Skipping game due to error: {str(e)}")
            continue
    
    return games

def seed_bgg_games():
    app = create_app()
    with app.app_context():
        try:
            # Clear existing games
            Game.query.delete()
            db.session.commit()
            
            # Parse BGG XML and create new games
            games = parse_bgg_collection('game_collections.xml')
            
            for game_data in games:
                game = Game(
                    name=game_data['name'],
                    comment=game_data['comment'],
                    release_year=game_data['release_year'],
                    image_url=game_data['image_url'],
                    bgg_id=game_data['bgg_id'],
                    created_at=game_data['created_at']
                )
                db.session.add(game)
            
            db.session.commit()
            print(f"Successfully imported {len(games)} games from BGG collection")
            
        except Exception as e:
            print(f"Error seeding BGG games: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    seed_bgg_games()