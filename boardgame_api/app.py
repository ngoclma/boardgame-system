from flask import Flask, jsonify, request
from flask_cors import CORS
from extensions import db, migrate
import os

# def create_app():
app = Flask(__name__)
# Initialize extensions
cors = CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }
})

# Load configuration
if os.environ.get('FLASK_ENV') == 'production':
    app.config.from_object('config.ProductionConfig')
else:
    app.config.from_object('config.DevelopmentConfig')

@app.before_request 
def before_request(): 
    headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } 
    if request.method == 'OPTIONS' or request.method == 'options': return jsonify(headers), 200

db.init_app(app)
migrate.init_app(app, db)

# Import and register blueprints
from controllers.game_controller import game_bp
from controllers.player_controller import player_bp
from controllers.game_play_controller import game_play_bp
from controllers.ranking_controller import ranking_bp

app.register_blueprint(game_bp, url_prefix='/api/games')
app.register_blueprint(player_bp, url_prefix='/api/players')
app.register_blueprint(game_play_bp, url_prefix='/api/game-plays')
app.register_blueprint(ranking_bp, url_prefix='/api/rankings')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return {'error': 'Not found'}, 404

@app.errorhandler(500)
def server_error(error):
    return {'error': 'Server error'}, 500

    # return app

if __name__ == '__main__':
    # app = create_app()
    app.run(debug=app.config['DEBUG'])