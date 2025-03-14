"""
Flask application for movie recommender system
"""
import os
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, Movie, User, Rating, Watchlist
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
        
        # Check if refresh is requested (force new recommendations)
        refresh_requested = request.args.get('refresh') == 'true'
        
        # Add timestamp and request_id for debugging
        request_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        request_id = f"req_{int(datetime.now().timestamp())}"
        
        # Log the request with details
        logger.info(f"[{request_id}] Recommendation request - User: {user_id}, Limit: {limit}, Refresh: {refresh_requested}, Time: {request_timestamp}")
        
        recommendations = []
        message = ""
        
        # Use a different approach based on whether refresh is requested
        if refresh_requested:
            logger.info(f"[{request_id}] Performing full refresh of recommendations for user {user_id}")
            recommendations = movie_recommender.refresh_recommendations(user_id, limit=limit)
            message = "Fresh recommendations based on your taste"
        else:
            logger.info(f"[{request_id}] Getting standard recommendations for user {user_id}")
            recommendations = movie_recommender.get_user_recommendations(user_id, limit=limit)
            message = "Based on your ratings"
        
        logger.info(f"[{request_id}] Generated {len(recommendations)} recommendations")
        
        if recommendations:
            # Add unique request identifier to response for debugging
            response = {
                "status": "success",
                "recommendations": [movie.to_dict() for movie in recommendations],
                "message": message,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "refreshed": refresh_requested,
                "request_id": request_id,
                "model_info": movie_recommender.get_model_info()
            }
            
            # Return with no-cache headers to prevent browser caching
            resp = jsonify(response)
            resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            resp.headers['Pragma'] = 'no-cache'
            resp.headers['Expires'] = '0'
            return resp
        else:
            # If no personalized recommendations, return popular movies
            popular_movies = Movie.query.order_by(Movie.popularity.desc()).limit(limit).all()
            
            # Return with no-cache headers
            resp = jsonify({
                "status": "success",
                "recommendations": [movie.to_dict() for movie in popular_movies],
                "message": "Popular movies you might like",
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "refreshed": refresh_requested,
                "request_id": request_id
            })
            resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            resp.headers['Pragma'] = 'no-cache'
            resp.headers['Expires'] = '0'
            return resp
            
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        logger.error(traceback.format_exc())
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
    """Check authentication status"""
    user_id = session.get('user_id')
    
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({
                "status": "success",
                "authenticated": True,
                "user": {
                    "id": user.id,
                    "username": user.username
                },
                "server_time": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            })
    
    return jsonify({
        "status": "success",
        "authenticated": False,
        "server_time": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    })

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

@app.route('/api/user/ratings', methods=['GET'])
def get_user_ratings():
    """Get all ratings by the current user with pagination and full movie details"""
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
        
        # Join Rating and Movie tables for efficient retrieval
        query = db.session.query(Rating, Movie)\
            .join(Movie, Rating.movie_id == Movie.id)\
            .filter(Rating.user_id == user_id)\
            .order_by(Rating.updated_at.desc())
        
        # Get total count for pagination
        total_ratings = query.count()
        
        # Apply pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format the response
        ratings = []
        for rating, movie in paginated.items:
            rating_data = {
                "id": rating.id,
                "movie_id": movie.id,
                "rating": rating.rating,
                "review": rating.review,
                "created_at": rating.created_at.isoformat() if rating.created_at else None,
                "updated_at": rating.updated_at.isoformat() if rating.updated_at else None,
                "movie": {
                    "id": movie.id,
                    "title": movie.title,
                    "poster_path": movie.poster_path,
                    "release_date": movie.release_date.isoformat() if movie.release_date else None,
                    "vote_average": movie.vote_average
                }
            }
            ratings.append(rating_data)
        
        return jsonify({
            "status": "success",
            "ratings": ratings,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total_ratings,
                "pages": paginated.pages
            }
        })
    
    except Exception as e:
        app.logger.error(f"Error fetching user ratings: {str(e)}")
        return jsonify({
            "status": "error", 
            "message": f"Error fetching ratings: {str(e)}"
        }), 500 

    
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
        
        # Join Rating and Movie tables for efficient retrieval
        query = db.session.query(Rating, Movie)\
            .join(Movie, Rating.movie_id == Movie.id)\
            .filter(Rating.user_id == user_id)\
            .order_by(Rating.updated_at.desc())
        
        # Get total count for pagination
        total_ratings = query.count()
        
        # Apply pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format the response
        rated_movies = []
        for rating, movie in paginated.items:
            # Convert movie to dict
            movie_data = movie.to_dict()
            # Add rating information
            movie_data['user_rating'] = rating.rating
            movie_data['rating_id'] = rating.id
            movie_data['user_review'] = rating.review
            movie_data['rated_at'] = rating.created_at.isoformat() if rating.created_at else None
            movie_data['updated_at'] = rating.updated_at.isoformat() if rating.updated_at else None
            
            rated_movies.append(movie_data)
        
        return jsonify({
            "status": "success",
            "rated_movies": rated_movies,
            "current_page": page,
            "pages": paginated.pages,
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
    
@app.route('/api/ratings/<int:movie_id>', methods=['POST'])
def add_rating(movie_id):
    """Add or update a movie rating"""
    try:
        # Check if user is authenticated
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({
                "status": "error", 
                "message": "Authentication required"
            }), 401
            
        # Check if movie exists
        movie = db.session.get(Movie, movie_id)
        if not movie:
            return jsonify({"status": "error", "message": "Movie not found"}), 404
            
        # Get data from request
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400
            
        rating_value = data.get('rating')
        review = data.get('review', '')
        
        if not rating_value or not isinstance(rating_value, (int, float)):
            return jsonify({"status": "error", "message": "Invalid rating value"}), 400
            
        # Check if rating already exists
        existing_rating = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = rating_value
            existing_rating.review = review
            existing_rating.updated_at = datetime.utcnow()
        else:
            # Create new rating
            new_rating = Rating(
                user_id=user_id,
                movie_id=movie_id,
                rating=rating_value,
                review=review
            )
            db.session.add(new_rating)
            
        db.session.commit()
        
        # Get the updated or new rating
        result_rating = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
        
        return jsonify({
            "status": "success",
            "message": "Rating saved successfully",
            "rating": result_rating.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving rating: {e}")
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
    
# Watchlist API Endpoints

@app.route('/api/watchlist', methods=['GET'])
def get_watchlist():
    """Get the current user's watchlist with pagination"""
    # Check authentication
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Authentication required"
        }), 401
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    
    try:
        # Join watchlist with movies to get full details
        query = db.session.query(Watchlist, Movie)\
            .join(Movie, Watchlist.movie_id == Movie.id)\
            .filter(Watchlist.user_id == user_id)\
            .order_by(Watchlist.created_at.desc())
        
        # Get total count for pagination
        total_count = query.count()
        
        # Apply pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format the response
        items = []
        for watchlist_item, movie in paginated.items:
            movie_dict = movie.to_dict()
            item_data = {
                "watchlist_id": watchlist_item.id,
                "added_at": watchlist_item.created_at.isoformat() if watchlist_item.created_at else None,
                "notes": watchlist_item.notes,
                "id": movie.id,  # Ensure we have the movie ID
                "title": movie.title,
                "poster_path": movie.poster_path,
                "release_date": movie.release_date.isoformat() if movie.release_date else None,
                "vote_average": movie.vote_average
            }
            items.append(item_data)
        
        return jsonify({
            "status": "success",
            "items": items,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total_count,
                "pages": paginated.pages
            }
        })
        
    except Exception as e:
        app.logger.error(f"Error fetching watchlist: {e}")
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve watchlist: {str(e)}"
        }), 500
    
@app.route('/api/watchlist', methods=['POST'])
def add_to_watchlist():
    """Add a movie to the user's watchlist"""
    # Check authentication
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Authentication required"
        }), 401
    
    data = request.get_json()
    if not data or 'movie_id' not in data:
        return jsonify({
            "status": "error",
            "message": "Movie ID is required"
        }), 400
    
    movie_id = data['movie_id']
    notes = data.get('notes', '')
    
    try:
        # Check if movie exists in the database
        movie = Movie.query.get(movie_id)
        if not movie:
            return jsonify({
                "status": "error",
                "message": f"Movie with ID {movie_id} not found"
            }), 404
        
        # Check if movie is already in watchlist
        existing = Watchlist.query.filter_by(
            user_id=user_id, 
            movie_id=movie_id
        ).first()
        
        if existing:
            return jsonify({
                "status": "error",
                "message": "Movie is already in your watchlist",
                "watchlist_id": existing.id
            }), 409
        
        # Add to watchlist
        watchlist_item = Watchlist(
            user_id=user_id,
            movie_id=movie_id,
            notes=notes,
            created_at=datetime.utcnow()
        )
        
        db.session.add(watchlist_item)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Movie added to watchlist",
            "watchlist_id": watchlist_item.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error adding to watchlist: {e}")
        return jsonify({
            "status": "error",
            "message": f"Failed to add movie to watchlist: {str(e)}"
        }), 500
    
@app.route('/api/watchlist/<int:watchlist_id>', methods=['DELETE'])
def remove_from_watchlist(watchlist_id):
    """Remove a movie from the user's watchlist"""
    # Check authentication
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Authentication required"
        }), 401
    
    try:
        # Find the watchlist item
        watchlist_item = Watchlist.query.filter_by(
            id=watchlist_id,
            user_id=user_id
        ).first()
        
        if not watchlist_item:
            return jsonify({
                "status": "error",
                "message": "Watchlist item not found"
            }), 404
        
        # Remove from database
        db.session.delete(watchlist_item)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Movie removed from watchlist"
        })
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error removing from watchlist: {e}")
        return jsonify({
            "status": "error",
            "message": f"Failed to remove movie from watchlist: {str(e)}"
        }), 500
    
@app.route('/api/watchlist/<int:watchlist_id>/notes', methods=['PUT'])
def update_watchlist_notes(watchlist_id):
    """Update notes for a watchlist item"""
    # Check authentication
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Authentication required"
        }), 401
    
    data = request.get_json()
    if not data or 'notes' not in data:
        return jsonify({
            "status": "error",
            "message": "Notes field is required"
        }), 400
    
    try:
        # Find the watchlist item
        watchlist_item = Watchlist.query.filter_by(
            id=watchlist_id,
            user_id=user_id
        ).first()
        
        if not watchlist_item:
            return jsonify({
                "status": "error",
                "message": "Watchlist item not found"
            }), 404
        
        # Update notes
        watchlist_item.notes = data['notes']
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Notes updated successfully"
        })
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating watchlist notes: {e}")
        return jsonify({
            "status": "error",
            "message": f"Failed to update notes: {str(e)}"
        }), 500
    
@app.route('/api/watchlist/check/<int:movie_id>', methods=['GET'])
def check_watchlist(movie_id):
    """Check if a movie is in the user's watchlist"""
    # Check authentication
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Authentication required"
        }), 401
    
    try:
        # First verify the movie exists
        movie = Movie.query.get(movie_id)
        if not movie:
            return jsonify({
                "status": "error",
                "message": f"Movie with ID {movie_id} not found"
            }), 404
            
        # Check if movie is in watchlist
        watchlist_item = Watchlist.query.filter_by(
            user_id=user_id,
            movie_id=movie_id
        ).first()
        
        if watchlist_item:
            return jsonify({
                "status": "success",
                "in_watchlist": True,
                "watchlist_id": watchlist_item.id,
                "notes": watchlist_item.notes,
                "added_at": watchlist_item.created_at.isoformat() if watchlist_item.created_at else None
            })
        else:
            return jsonify({
                "status": "success",
                "in_watchlist": False
            })
            
    except Exception as e:
        app.logger.error(f"Error checking watchlist: {e}")
        return jsonify({
            "status": "error",
            "message": f"Failed to check watchlist: {str(e)}"
        }), 500

    


if __name__ == '__main__':
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Initialize recommendation model
        movie_recommender.initialize_recommendation_model()
    
    app.run(debug=True, port=5000)