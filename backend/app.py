from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Movie, User, Rating
import recommender
import os
from dotenv import load_dotenv
from sqlalchemy import func
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'mysql+mysqlconnector://root:password@localhost/movie_recommender_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
CORS(app)
db.init_app(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the application
@app.route('/api/initialize', methods=['GET'])
def initialize_app():
    """Initialize the application, create tables if they don't exist"""
    with app.app_context():
        db.create_all()
        # Check if we have movies in the database
        if Movie.query.count() == 0:
            try:
                recommender.load_initial_data()
                logger.info("Initial movie data loaded successfully")
                return jsonify({"status": "success", "message": "Database initialized with sample data"}), 200
            except Exception as e:
                logger.error(f"Error loading initial data: {e}")
                return jsonify({"status": "error", "message": f"Error initializing database: {str(e)}"}), 500
        return jsonify({"status": "success", "message": "Database already initialized"}), 200


# API Routes
@app.route('/api/movies', methods=['GET'])
def get_movies():
    """
    Get a list of movies with optional pagination
    Query parameters:
    - limit: Number of movies to return (default: 20)
    - offset: Number of movies to skip (default: 0)
    """
    try:
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        movies = Movie.query.order_by(Movie.popularity.desc()).limit(limit).offset(offset).all()
        total_count = Movie.query.count()
        
        return jsonify({
            "movies": [movie.to_dict() for movie in movies],
            "total": total_count
        }), 200
    except Exception as e:
        logger.error(f"Error fetching movies: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/movies/<int:movie_id>', methods=['GET'])
def get_movie(movie_id):
    """Get a specific movie by ID"""
    try:
        movie = Movie.query.get(movie_id)
        
        if not movie:
            return jsonify({"error": "Movie not found"}), 404
        
        # Get average rating
        avg_rating = db.session.query(func.avg(Rating.rating)).filter(Rating.movie_id == movie_id).scalar() or 0
        
        # Get movie data with average rating
        movie_data = movie.to_dict()
        movie_data['average_rating'] = float(avg_rating)
        
        return jsonify(movie_data), 200
    except Exception as e:
        logger.error(f"Error fetching movie {movie_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/movies/search', methods=['GET'])
def search_movies():
    """
    Search for movies by title or genre
    Query parameters:
    - query: Search term for title
    - genre: Filter by genre
    """
    try:
        search_query = request.args.get('query', '')
        genre = request.args.get('genre', '')
        
        # Check if this is a direct title search that should use the OMDb API
        if search_query and not genre and len(Movie.query.filter(Movie.title.ilike(f'%{search_query}%')).limit(5).all()) < 5:
            # Try to find movies through OMDb API
            omdb_movies = recommender.search_movies_by_title(search_query)
            
            if omdb_movies:
                return jsonify({
                    "movies": omdb_movies,
                    "count": len(omdb_movies),
                    "source": "omdb"
                }), 200
        
        # Otherwise use database search
        query = Movie.query
        
        # Apply filters if provided
        if search_query:
            query = query.filter(Movie.title.ilike(f'%{search_query}%'))
        
        if genre:
            query = query.filter(Movie.genres.ilike(f'%{genre}%'))
        
        # Get results
        movies = query.order_by(Movie.popularity.desc()).limit(50).all()
        
        return jsonify({
            "movies": [movie.to_dict() for movie in movies],
            "count": len(movies),
            "source": "database"
        }), 200
    except Exception as e:
        logger.error(f"Error searching movies: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/recommendations/<int:movie_id>', methods=['GET'])
def get_recommendations(movie_id):
    """Get movie recommendations based on a movie ID"""
    try:
        # Verify movie exists
        movie = Movie.query.get(movie_id)
        if not movie:
            return jsonify({"error": "Movie not found"}), 404
        
        # Get recommendations
        recommendations = recommender.get_movie_recommendations(movie_id)
        
        # Get full movie details for recommendations
        recommended_movies = Movie.query.filter(Movie.id.in_(recommendations)).all()
        
        return jsonify({
            "recommendations": [movie.to_dict() for movie in recommended_movies]
        }), 200
    except Exception as e:
        logger.error(f"Error getting recommendations for movie {movie_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/user-recommendations/<int:user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    """Get personalized movie recommendations for a user"""
    try:
        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Check if user has ratings
        ratings = Rating.query.filter_by(user_id=user_id).all()
        if not ratings:
            return jsonify({"error": "User has no ratings yet"}), 400
        
        # Get recommendations
        recommendations = recommender.get_user_recommendations(user_id)
        
        # Get full movie details for recommendations
        recommended_movies = Movie.query.filter(Movie.id.in_(recommendations)).all()
        
        return jsonify({
            "recommendations": [movie.to_dict() for movie in recommended_movies]
        }), 200
    except Exception as e:
        logger.error(f"Error getting recommendations for user {user_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/ratings', methods=['POST'])
def add_rating():
    """Add or update a movie rating"""
    try:
        data = request.get_json()
        
        # Validate input
        if not all(k in data for k in ['user_id', 'movie_id', 'rating']):
            return jsonify({"error": "Missing required fields"}), 400
        
        user_id = data['user_id']
        movie_id = data['movie_id']
        rating_value = float(data['rating'])
        
        # Validate rating range
        if not (0 <= rating_value <= 5):
            return jsonify({"error": "Rating must be between 0 and 5"}), 400
        
        # Check if user and movie exist
        user = User.query.get(user_id)
        movie = Movie.query.get(movie_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if not movie:
            return jsonify({"error": "Movie not found"}), 404
        
        # Check if rating exists and update, or create new
        existing_rating = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
        
        if existing_rating:
            existing_rating.rating = rating_value
        else:
            new_rating = Rating(user_id=user_id, movie_id=movie_id, rating=rating_value)
            db.session.add(new_rating)
        
        db.session.commit()
        
        return jsonify({"message": "Rating saved successfully"}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding rating: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        
        # Validate input
        if not all(k in data for k in ['username', 'email', 'password']):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if username or email already exists
        existing_user = User.query.filter(
            (User.username == data['username']) | (User.email == data['email'])
        ).first()
        
        if existing_user:
            return jsonify({"error": "Username or email already exists"}), 409
        
        # Create new user
        new_user = User(
            username=data['username'],
            email=data['email']
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User created successfully", "user_id": new_user.id}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating user: {e}")
        return jsonify({"error": str(e)}), 500


# Run the application
if __name__ == '__main__':
    app.run(debug=True)