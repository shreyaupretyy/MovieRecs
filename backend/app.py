"""
Flask application for movie recommender system
"""
import os
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, Movie, User, Rating
import recommender
from werkzeug.security import generate_password_hash, check_password_hash

# Import data service but don't run it automatically
import omdb_service

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'mysql+mysqlconnector://root:password@localhost/movie_recommender')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key')

# Configure CORS
CORS(app, 
    origins=["http://localhost:3000", "http://localhost:5173"], 
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Initialize extensions
db.init_app(app)

# Initialize recommender
movie_recommender = recommender.MovieRecommender(db, Movie)

@app.before_request
def initialize_app():
    """Initialize database and recommender model"""
    with app.app_context():
        # Create database tables
        db.create_all()
        
        # Initialize recommendation model
        movie_recommender.initialize_recommendation_model()

@app.route('/api/healthcheck', methods=['GET'])
def healthcheck():
    """Health check endpoint"""
    import sys
    
    try:
        # Check database connection by querying movie count
        movie_count = Movie.query.count()
        user_count = User.query.count()
        
        return jsonify({
            "status": "success",
            "message": "API is working",
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "python_version": sys.version,
            "database_info": {
                "movie_count": movie_count,
                "user_count": user_count,
                "connected": True
            }
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "error",
            "message": f"Health check failed: {str(e)}"
        }), 500

@app.route('/api/initialize', methods=['GET'])
def initialize_database():
    """Initialize the application, create tables if needed"""
    try:
        # Create tables (ensure they are created)
        db.create_all()
        
        # Check if we have movies in the database
        movie_count = Movie.query.count()
        logger.info(f"Current movie count in database: {movie_count}")
        
        if movie_count < 5:  # Ensure we have at least 5 movies
            logger.info("Loading movie data...")
            
            # First try to load from OMDb API
            if os.environ.get('OMDB_API_KEY'):
                logger.info("OMDb API key found, will use API if requested")
                # Note: We don't automatically fetch from OMDb anymore
                # This will be done through a separate endpoint
                
                # Instead, load sample data
                result = omdb_service.load_sample_data(db, Movie)
                logger.info(f"Sample data loading result: {result}")
                
                # Get updated movie count
                updated_movie_count = Movie.query.count()
                
                # Initialize recommendation model with available data
                movie_recommender.initialize_recommendation_model()
                
                return jsonify({
                    "status": "success", 
                    "message": f"Database initialized with {updated_movie_count} sample movies",
                    "count": updated_movie_count
                }), 200
            else:
                logger.info("No OMDb API key found, loading sample data only")
                result = omdb_service.load_sample_data(db, Movie)
                
                # Get updated movie count
                updated_movie_count = Movie.query.count()
                
                # Initialize recommendation model with available data
                movie_recommender.initialize_recommendation_model()
                
                return jsonify({
                    "status": "success", 
                    "message": f"Database initialized with {updated_movie_count} sample movies (no API key found)",
                    "count": updated_movie_count
                }), 200
        
        return jsonify({
            "status": "success", 
            "message": f"Database already initialized with {movie_count} movies",
            "count": movie_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error initializing database: {e}")
        return jsonify({"status": "error", "message": f"Error initializing database: {str(e)}"}), 500

@app.route('/api/movies/load-from-omdb', methods=['POST'])
def load_movies_from_omdb():
    """
    Endpoint to manually load movies from OMDb API
    This replaces the previous fetch_more_movies functionality
    """
    try:
        # Check if force refresh parameter is provided
        force_refresh = request.json.get('force_refresh', False) if request.is_json else False
        
        # Call the omdb service to fetch and store movies
        result = omdb_service.fetch_and_store_movies(db, Movie, force_refresh)
        
        if result["status"] == "success":
            # Reinitialize recommendation model with new data
            movie_recommender.initialize_recommendation_model()
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error loading movies from OMDb: {e}")
        return jsonify({
            "status": "error", 
            "message": f"Error loading movies from OMDb: {str(e)}"
        }), 500

@app.route('/api/movies', methods=['GET'])
def get_movies():
    """Get paginated movies with optional sorting and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        sort_by = request.args.get('sort_by', 'popularity')
        order = request.args.get('order', 'desc')
        genre = request.args.get('genre')
        search = request.args.get('search')
        
        # Log received parameters for debugging
        app.logger.info(f"Search request params: page={page}, per_page={per_page}, sort_by={sort_by}, order={order}, genre={genre}, search={search}")
        
        # Build base query
        query = Movie.query
        
        # Apply genre filter if provided
        if genre:
            query = query.filter(
                db.or_(
                    Movie.genres.like(f'%{genre}%'),
                    Movie.genres.like(f'%{genre}|%'),
                    Movie.genres.like(f'%|{genre}|%'),
                    Movie.genres.like(f'%|{genre}%'),
                    Movie.genres.like(f'%{genre},%'),
                    Movie.genres.like(f'%,{genre},%'),
                    Movie.genres.like(f'%,{genre}%')
                )
            )
        
        # Apply search term if provided
        if search:
            app.logger.info(f"Applying search filter: {search}")
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Movie.title.like(search_term),
                    Movie.overview.like(search_term),
                    Movie.actors.like(search_term),
                    Movie.director.like(search_term)
                )
            )
            app.logger.info(f"SQL query after search filter: {str(query)}")
        
        # Apply sorting
        if sort_by == 'title':
            if order == 'asc':
                query = query.order_by(Movie.title.asc())
            else:
                query = query.order_by(Movie.title.desc())
        elif sort_by == 'release_date':
            if order == 'asc':
                query = query.order_by(Movie.release_date.asc())
            else:
                query = query.order_by(Movie.release_date.desc())
        elif sort_by == 'vote_average':
            if order == 'asc':
                query = query.order_by(Movie.vote_average.asc())
            else:
                query = query.order_by(Movie.vote_average.desc())
        else:  # Default to popularity
            if order == 'asc':
                query = query.order_by(Movie.popularity.asc())
            else:
                query = query.order_by(Movie.popularity.desc())
        
        # Execute pagination
        app.logger.info(f"Executing paginated query: page={page}, per_page={per_page}")
        paginated = query.paginate(page=page, per_page=per_page)
        
        # Log results
        app.logger.info(f"Found {paginated.total} movies matching criteria")
        
        # Prepare response
        movies_list = []
        for movie in paginated.items:
            movies_list.append(movie.to_dict())
        
        return jsonify({
            "status": "success",
            "movies": movies_list,
            "current_page": page,
            "pages": paginated.pages,
            "total": paginated.total
        })
    
    except Exception as e:
        app.logger.error(f"Error fetching movies: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Failed to fetch movies: {str(e)}"
        }), 500

@app.route('/api/movies/<int:movie_id>', methods=['GET'])
def get_movie(movie_id):
    """Get details for a specific movie by ID"""
    try:
        # Try to find movie by regular ID first
        movie = Movie.query.get(movie_id)
        
        # If not found by regular ID, try as TMDb ID
        if not movie:
            movie = Movie.query.filter_by(tmdb_id=str(movie_id)).first()
            
        # If still not found, return error
        if not movie:
            return jsonify({
                "status": "error",
                "message": f"Movie with ID {movie_id} not found"
            }), 404
            
        # Get the user's rating if they're logged in
        user_rating = None
        user_review = None
        
        current_user_id = get_current_user_id()
        if current_user_id:
            rating = Rating.query.filter_by(
                user_id=current_user_id,
                movie_id=movie.id
            ).first()
            
            if rating:
                user_rating = rating.rating  # Use rating.rating instead of rating.value
                user_review = rating.review
        
        # Convert movie to dict for response
        movie_data = movie.to_dict()
        
        # Add extra fields
        if user_rating:
            movie_data['user_rating'] = user_rating
        if user_review:
            movie_data['user_review'] = user_review
            
        # Get similar movies (based on genres)
        similar_movies = []
        
        if movie.genres:
            # Split genres
            genres = movie.genres.replace('|', ',').split(',') if movie.genres else []
            genres = [g.strip() for g in genres if g.strip()]
            
            if genres:
                # Find movies with similar genres, excluding the current movie
                similar_query = Movie.query.filter(Movie.id != movie.id)
                
                # Use OR condition for genres
                genre_filters = []
                for genre in genres:
                    genre_filters.append(Movie.genres.like(f'%{genre}%'))
                
                similar_query = similar_query.filter(db.or_(*genre_filters))
                
                # Order by popularity and limit
                similar_query = similar_query.order_by(Movie.popularity.desc()).limit(6)
                similar_movies = [m.to_dict() for m in similar_query.all()]
        
        movie_data['similar_movies'] = similar_movies
            
        return jsonify(movie_data)
        
    except Exception as e:
        app.logger.error(f"Error fetching movie details: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to retrieve movie details"
        }), 500

# Helper function to get current user ID
def get_current_user_id():
    """Get the current user ID from session"""
    if 'user_id' in session:
        return session['user_id']
    return None

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Get personalized recommendations for the current user"""
    try:
        # Check if user is authenticated
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({
                "status": "error", 
                "message": "Authentication required"
            }), 401
            
        # Get limit parameter
        limit = request.args.get('limit', 8, type=int)
        
        # Get recommendations
        recommendations = movie_recommender.get_user_recommendations(user_id, limit=limit)
        
        if recommendations:
            return jsonify({
                "status": "success",
                "recommendations": [movie.to_dict() for movie in recommendations],
                "message": "Based on your ratings"
            })
        else:
            # If no personalized recommendations, return popular movies
            popular_movies = Movie.query.order_by(Movie.popularity.desc()).limit(limit).all()
            
            return jsonify({
                "status": "success",
                "recommendations": [movie.to_dict() for movie in popular_movies],
                "message": "Popular movies you might like"
            })
            
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({"status": "error", "message": "No input data provided"}), 400
            
        # Check if required fields are present
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({"status": "error", "message": "Missing required fields"}), 400
            
        # Check if username already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"status": "error", "message": "Username already exists"}), 409
            
        # Check if email already exists
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            return jsonify({"status": "error", "message": "Email already in use"}), 409
            
        # Create a new user
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        
        # Set optional fields
        if 'bio' in data and data['bio']:
            new_user.bio = data['bio']
        
        if 'favorite_genre' in data and data['favorite_genre']:
            new_user.favorite_genre = data['favorite_genre']
        
        # Add to database
        db.session.add(new_user)
        db.session.commit()
        
        # Set session
        session['user_id'] = new_user.id
        session['username'] = new_user.username
        
        return jsonify({
            "status": "success", 
            "message": "User registered successfully",
            "user": new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error registering user: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Log in a user"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({"status": "error", "message": "No input data provided"}), 400
            
        # Check if required fields are present
        username = data.get('username')
        password = data.get('password')
        
        if not all([username, password]):
            return jsonify({"status": "error", "message": "Missing required fields"}), 400
            
        # Find user by username
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401
            
        # Set session
        session['user_id'] = user.id
        session['username'] = user.username
        
        return jsonify({
            "status": "success", 
            "message": "Login successful",
            "user": user.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Error logging in: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Log out a user"""
    try:
        # Clear session
        session.pop('user_id', None)
        session.pop('username', None)
        
        return jsonify({
            "status": "success", 
            "message": "Logout successful"
        })
        
    except Exception as e:
        logger.error(f"Error logging out: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    """Check if the user is authenticated"""
    try:
        # Check if user is authenticated
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({
                "status": "success", 
                "authenticated": False
            })
            
        # Get user
        user = User.query.get(user_id)
        
        if not user:
            # Clear invalid session
            session.pop('user_id', None)
            session.pop('username', None)
            return jsonify({
                "status": "success", 
                "authenticated": False
            })
            
        return jsonify({
            "status": "success",
            "authenticated": True,
            "user": user.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Error checking authentication: {e}")
        return jsonify({
            "status": "error", 
            "message": str(e),
            "authenticated": False
        }), 500

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get the current user's profile"""
    try:
        # Check if user is authenticated
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({
                "status": "error", 
                "message": "Authentication required"
            }), 401
            
        # Get user
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                "status": "error", 
                "message": "User not found"
            }), 404
            
        return jsonify({
            "status": "success",
            "user": user.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/current-user', methods=['GET'])
def get_current_user():
    """Get the current user"""
    try:
        # Check if user is  enticated
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({
                "status": "error", 
                "message": "Not authenticated",
                "authenticated": False
            }), 401
            
        # Get user
        user = User.query.get(user_id)
        
        if not user:
            # Clear invalid session
            session.pop('user_id', None)
            session.pop('username', None)
            return jsonify({
                "status": "error", 
                "message": "User not found",
                "authenticated": False
            }), 401
            
        return jsonify({
            "status": "success",
            "authenticated": True,
            "user": user.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/ratings', methods=['POST'])
def add_rating():
    """Add or update a movie rating"""
    try:
        # Check if user is authenticated
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({
                "status": "error", 
                "message": "Authentication required"
            }), 401
            
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({"status": "error", "message": "No input data provided"}), 400
            
        # Check if required fields are present
        movie_id = data.get('movie_id')
        rating_value = data.get('rating')
        
        if not all([movie_id, rating_value]):
            return jsonify({"status": "error", "message": "Missing required fields"}), 400
            
        # Validate rating value
        if not (0.5 <= float(rating_value) <= 5.0):
            return jsonify({"status": "error", "message": "Rating must be between 0.5 and 5.0"}), 400
            
        # Check if movie exists
        movie = Movie.query.get(movie_id)
        if not movie:
            return jsonify({"status": "error", "message": "Movie not found"}), 404
            
        # Check if rating exists
        existing_rating = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = float(rating_value)  # Use rating consistently
            
            # Update review if provided
            if 'review' in data:
                existing_rating.review = data['review']
                
            existing_rating.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                "status": "success", 
                "message": "Rating updated successfully",
                "rating": existing_rating.to_dict()
            })
        else:
            # Create new rating
            new_rating = Rating(
                user_id=user_id,
                movie_id=movie_id,
                rating=float(rating_value)  # Use rating consistently
            )
            
            # Add review if provided
            if 'review' in data:
                new_rating.review = data['review']
            
            # Add to database
            db.session.add(new_rating)
            db.session.commit()
            
            return jsonify({
                "status": "success", 
                "message": "Rating added successfully",
                "rating": new_rating.to_dict()
            }), 201
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding rating: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    

    
@app.route('/api/user/rated-movies', methods=['GET'])
def get_user_rated_movies():
    """Get all movies rated by the current user with pagination and full movie details"""
    try:
        # Check if user is authenticated
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                "status": "error", 
                "message": "Authentication required"
            }), 401
        
        # Get pagination parameters from query
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get all ratings for this user
        ratings_query = Rating.query.filter_by(user_id=user_id).order_by(Rating.updated_at.desc())
        
        # Get total count for pagination
        total_ratings = ratings_query.count()
        
        # Apply pagination
        paginated_ratings = ratings_query.paginate(page=page, per_page=per_page)
        
        # For each rating, get the full movie details
        rated_movies = []
        for rating in paginated_ratings.items:
            # Get the movie
            movie = Movie.query.get(rating.movie_id)
            if movie:
                # Convert movie to dict
                movie_data = movie.to_dict()
                # Add rating information
                movie_data['user_rating'] = rating.rating
                movie_data['user_review'] = rating.review
                movie_data['rated_at'] = rating.created_at.isoformat() if rating.created_at else None
                movie_data['updated_at'] = rating.updated_at.isoformat() if rating.updated_at else None
                
                rated_movies.append(movie_data)
        
        return jsonify({
            "status": "success",
            "rated_movies": rated_movies,
            "current_page": page,
            "pages": paginated_ratings.pages,
            "total": total_ratings
        })
    
    except Exception as e:
        app.logger.error(f"Error fetching user rated movies: {str(e)}")
        return jsonify({
            "status": "error", 
            "message": f"Error fetching rated movies: {str(e)}"
        }), 500

@app.route('/api/ratings/<int:movie_id>', methods=['GET'])
def get_movie_rating(movie_id):
    """Get user's rating for a specific movie"""
    try:
        # Check if user is authenticated
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({
                "status": "error", 
                "message": "Authentication required"
            }), 401
            
        # Check if movie exists
        movie = db.session.get(Movie, movie_id)  # Updated to new style
        if not movie:
            return jsonify({"status": "error", "message": "Movie not found"}), 404
            
        # Get rating
        rating = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
        
        if rating:
            # Include both the whole rating object and extract the numeric rating value
            rating_dict = rating.to_dict()
            return jsonify({
                "status": "success",
                "rating": rating_dict,
                "rating_value": rating.rating,  # Add this for clarity
                "has_rated": True
            })
        else:
            return jsonify({
                "status": "success",
                "rating": None,
                "rating_value": None,
                "has_rated": False
            })
            
    except Exception as e:
        logger.error(f"Error getting movie rating: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/ratings/<int:movie_id>', methods=['DELETE'])
def delete_rating(movie_id):
    """Delete a movie rating"""
    try:
        # Check if user is authenticated
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({
                "status": "error", 
                "message": "Authentication required"
            }), 401
            
        # Check if rating exists
        rating = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
        
        if not rating:
            return jsonify({"status": "error", "message": "Rating not found"}), 404
            
        # Delete rating
        db.session.delete(rating)
        db.session.commit()
        
        return jsonify({
            "status": "success", 
            "message": "Rating deleted successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting rating: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/genres', methods=['GET'])
def get_genres():
    """Get all unique genres from the movies database"""
    try:
        # This query extracts all unique genres from the database
        all_movies = Movie.query.all()
        all_genres = set()
        
        # Extract genres from each movie
        for movie in all_movies:
            if movie.genres:
                # Handle pipe separated genres
                if '|' in movie.genres:
                    movie_genres = movie.genres.split('|')
                # Handle comma separated genres
                elif ',' in movie.genres:
                    movie_genres = movie.genres.split(',')
                else:
                    movie_genres = [movie.genres]  # Single genre
                    
                # Add each genre to our set
                for genre in movie_genres:
                    genre = genre.strip()
                    if genre and genre != 'N/A':
                        all_genres.add(genre)
        
        # Convert to sorted list
        genre_list = sorted(list(all_genres))
        
        return jsonify({
            "status": "success",
            "genres": genre_list
        })
    except Exception as e:
        app.logger.error(f"Error fetching genres: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to retrieve genres"
        }), 500

if __name__ == '__main__':
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Initialize recommendation model
        movie_recommender.initialize_recommendation_model()
    
    app.run(debug=True, port=5000)