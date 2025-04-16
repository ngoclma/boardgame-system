import pandas as pd
from datetime import datetime
from app import db
from models.game import Game
from models.player import Player
from models.game_play import GamePlay
from models.play_result import PlayResult
from services.ranking_service import calculate_victory_points

def import_from_excel(file_path, game_id):
    """
    Import game play data from Excel file
    
    Expected columns:
    - No: Game play number
    - Date: Date of the game play
    - Time start: Start time
    - Time end: End time
    - Duration (min): Duration in minutes
    - No of players: Number of players
    - Mode: Game mode
    - Results: Player results in format "Player: Score"
    """
    try:
        # Read Excel file
        df = pd.read_excel(file_path)
        
        # Skip empty rows and headers/footers
        df = df[df['No'].notna() & df['Date'].notna() & df['Results'].notna()]
        
        for _, row in df.iterrows():
            # Parse date and times
            date_str = str(row['Date']).strip()
            
            try:
                # Try different date formats
                date_obj = None
                for date_format in ['%d/%m/%Y', '%m/%d/%Y', '%Y-%m-%d']:
                    try:
                        date_obj = datetime.strptime(date_str, date_format).date()
                        break
                    except ValueError:
                        continue
                
                if date_obj is None:
                    print(f"Could not parse date: {date_str}")
                    continue
                
                # Parse start and end times
                start_time_str = str(row['Time start']).strip()
                end_time_str = str(row['Time end']).strip()
                
                start_time = None
                end_time = None
                
                if start_time_str and start_time_str != 'nan':
                    try:
                        # Handle different time formats (HH:MM or HHMM)
                        if ':' in start_time_str:
                            hours, minutes = map(int, start_time_str.split(':'))
                        else:
                            hours = int(start_time_str) // 100
                            minutes = int(start_time_str) % 100
                        
                        start_time = datetime.combine(date_obj, datetime.min.time().replace(hour=hours, minute=minutes))
                    except (ValueError, TypeError):
                        print(f"Could not parse start time: {start_time_str}")
                
                if end_time_str and end_time_str != 'nan':
                    try:
                        # Handle different time formats (HH:MM or HHMM)
                        if ':' in end_time_str:
                            hours, minutes = map(int, end_time_str.split(':'))
                        else:
                            hours = int(end_time_str) // 100
                            minutes = int(end_time_str) % 100
                        
                        end_time = datetime.combine(date_obj, datetime.min.time().replace(hour=hours, minute=minutes))
                    except (ValueError, TypeError):
                        print(f"Could not parse end time: {end_time_str}")
                
                # Create game play
                game_play = GamePlay(
                    game_id=game_id,
                    start_time=start_time,
                    end_time=end_time,
                    duration=row.get('Duration (min)'),
                    mode=row.get('Mode'),
                    notes=None
                )
                
                db.session.add(game_play)
                db.session.flush()  # Get the ID without committing
                
                # Parse results
                results_str = row['Results']
                result_lines = results_str.strip().split('\n')
                
                player_ranks = []
                
                for i, result_line in enumerate(result_lines):
                    if not result_line.strip():
                        continue
                    
                    # Expected format: "Player: Score"
                    parts = result_line.split(':', 1)
                    if len(parts) != 2:
                        print(f"Invalid result format: {result_line}")
                        continue
                    
                    player_name = parts[0].strip()
                    score_str = parts[1].strip()
                    
                    # Check if player exists, create if not
                    player = Player.query.filter_by(name=player_name).first()
                    if not player:
                        player = Player(name=player_name)
                        db.session.add(player)
                        db.session.flush()
                    
                    # Parse score
                    try:
                        score = int(score_str.split()[0])
                    except (ValueError, IndexError):
                        score = 0
                    
                    # Add to player_ranks for victory point calculation
                    player_ranks.append((player.player_id, i + 1))  # Rank based on position in results
                
                # Calculate victory points
                victory_points_map = calculate_victory_points(player_ranks)
                
                # Create result entries
                for player_id, rank in player_ranks:
                    result = PlayResult(
                        play_id=game_play.play_id,
                        player_id=player_id,
                        score=None,  # Score would need more parsing
                        rank=rank,
                        victory_points=victory_points_map.get(player_id, 0),
                        notes=None
                    )
                    db.session.add(result)
                
                db.session.commit()
                print(f"Imported game play #{row['No']}")
                
            except Exception as e:
                db.session.rollback()
                print(f"Error importing row {row['No']}: {e}")
        
        return True
    except Exception as e:
        print(f"Error importing file: {e}")
        return False