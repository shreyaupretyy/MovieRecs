import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests
from datetime import datetime
import json
from models import db, Movie
import logging
import os
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
OMDB_API_KEY = os.environ.get('OMDB_API_KEY')
SIMILARITY_MATRIX = None
MOVIE_INDICES = None

# Popular movie IMDb IDs to fetch when initializing the database
# These are some of the most popular movies from different genres
POPULAR_MOVIE_IMDB_IDS = [
    'tt0111161',  # The Shawshank Redemption
    'tt0068646',  # The Godfather
    'tt0071562',  # The Godfather Part II
    'tt0468569',  # The Dark Knight
    'tt0050083',  # 12 Angry Men
    'tt0108052',  # Schindler's List
    'tt0167260',  # The Lord of the Rings: The Return of the King
    'tt0110912',  # Pulp Fiction
    'tt0060196',  # The Good, the Bad and the Ugly
    'tt0137523',  # Fight Club
    'tt0109830',  # Forrest Gump
    'tt0080684',  # Star Wars: Episode V - The Empire Strikes Back
    'tt0167261',  # The Lord of the Rings: The Two Towers
    'tt0073486',  # One Flew Over the Cuckoo's Nest
    'tt0099685',  # Goodfellas
    'tt0133093',  # The Matrix
    'tt0047478',  # Seven Samurai
    'tt0076759',  # Star Wars: Episode IV - A New Hope
    'tt0120737',  # The Lord of the Rings: The Fellowship of the Ring
    'tt0816692',  # Interstellar
    'tt0078748',  # Alien
    'tt0245429',  # Spirited Away
    'tt0120815',  # Saving Private Ryan
    'tt0114369',  # Se7en
    'tt0102926',  # The Silence of the Lambs
    'tt0038650',  # It's a Wonderful Life
    'tt0118799',  # Life Is Beautiful
    'tt0317248',  # City of God
    'tt0120689',  # The Green Mile
    'tt0110357',  # The Lion King
]


def load_initial_data():
    """
    Load initial movie data from OMDb API or use sample data if API key is not available
    """
    try:
        # Check if we have an OMDb API key
        if OMDB_API_KEY:
            logger.info("Using OMDb API to fetch initial movie data")
            fetch_from_omdb()
        else:
            logger.info("No OMDb API key found, using sample data")
            load_sample_data()
            
        # Initialize the recommendation model
        initialize_recommendation_model()
            
    except Exception as e:
        logger.error(f"Error loading initial data: {e}")
        raise


def fetch_from_omdb():
    """
    Fetch movies from OMDb API using a list of popular IMDb IDs
    """
    try:
        # Counter for successful fetches
        successful_fetches = 0
        
        # Fetch data for each movie in our list of popular IMDb IDs
        for imdb_id in POPULAR_MOVIE_IMDB_IDS:
            try:
                # Build URL for the OMDb API request
                url = f"http://www.omdbapi.com/?i={imdb_id}&apikey={OMDB_API_KEY}&plot=full"
                
                # Make the request to the OMDb API
                response = requests.get(url)
                movie_data = response.json()
                
                # Check if the request was successful
                if movie_data.get('Response') == 'True':
                    # Process release date
                    release_date = None
                    if movie_data.get('Released') and movie_data.get('Released') != 'N/A':
                        try:
                            # Parse the date from format "DD MMM YYYY"
                            release_date = datetime.strptime(movie_data['Released'], '%d %b %Y').date()
                        except ValueError:
                            logger.warning(f"Could not parse release date for {imdb_id}: {movie_data.get('Released')}")
                    
                    # Prepare genres as pipe separated string
                    genres = movie_data.get('Genre', 'N/A').replace(', ', '|')
                    
                    # Extract numeric values from Ratings if available
                    imdb_rating = 0.0
                    vote_count = 0
                    if movie_data.get('imdbRating') != 'N/A':
                        imdb_rating = float(movie_data.get('imdbRating', 0))
                    if movie_data.get('imdbVotes') != 'N/A':
                        vote_count = int(movie_data.get('imdbVotes', '0').replace(',', ''))
                    
                    # Check if movie exists by IMDb ID
                    existing_movie = Movie.query.filter_by(imdb_id=imdb_id).first()
                    
                    if existing_movie:
                        # Update existing movie
                        existing_movie.title = movie_data.get('Title', '')
                        existing_movie.overview = movie_data.get('Plot', '')
                        existing_movie.poster_path = movie_data.get('Poster', '') if movie_data.get('Poster') != 'N/A' else ''
                        existing_movie.release_date = release_date
                        existing_movie.genres = genres
                        existing_movie.popularity = vote_count / 1000 if vote_count > 0 else 0  # Normalize popularity
                        existing_movie.vote_average = imdb_rating
                        existing_movie.vote_count = vote_count
                        existing_movie.director = movie_data.get('Director', '') if movie_data.get('Director') != 'N/A' else ''
                        existing_movie.actors = movie_data.get('Actors', '') if movie_data.get('Actors') != 'N/A' else ''
                    else:
                        # Create new movie
                        new_movie = Movie(
                            imdb_id=imdb_id,
                            title=movie_data.get('Title', ''),
                            overview=movie_data.get('Plot', ''),
                            poster_path=movie_data.get('Poster', '') if movie_data.get('Poster') != 'N/A' else '',
                            release_date=release_date,
                            genres=genres,
                            popularity=vote_count / 1000 if vote_count > 0 else 0,  # Normalize popularity
                            vote_average=imdb_rating,
                            vote_count=vote_count,
                            director=movie_data.get('Director', '') if movie_data.get('Director') != 'N/A' else '',
                            actors=movie_data.get('Actors', '') if movie_data.get('Actors') != 'N/A' else ''
                        )
                        db.session.add(new_movie)
                    
                    successful_fetches += 1
                else:
                    logger.warning(f"Failed to fetch data for IMDb ID {imdb_id}: {movie_data.get('Error')}")
                
                # Commit after each successful fetch
                db.session.commit()
                
                # Respect rate limiting (1000 requests per day = ~1 request per 86 seconds)
                # We'll wait 1 second between requests to be safe
                time.sleep(1)
                
            except Exception as e:
                db.session.rollback()
                logger.error(f"Error processing movie {imdb_id}: {e}")
                # Continue with the next movie
        
        logger.info(f"Successfully fetched and stored {successful_fetches} movies from OMDb API")
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error fetching from OMDb: {e}")
        raise


def load_sample_data():
    """
    Load sample movie data when OMDb API is not available
    """
    try:
        # Sample movies data
        sample_movies = [
            {
                "id": 1,
                "imdb_id": "tt0111161",
                "title": "The Shawshank Redemption",
                "overview": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
                "poster_path": "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
                "release_date": "1994-09-23",
                "genres": "Drama",
                "popularity": 85.0,
                "vote_average": 9.3,
                "vote_count": 2615180,
                "director": "Frank Darabont",
                "actors": "Tim Robbins, Morgan Freeman, Bob Gunton"
            },
            {
                "id": 2,
                "imdb_id": "tt0068646",
                "title": "The Godfather",
                "overview": "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
                "poster_path": "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
                "release_date": "1972-03-14",
                "genres": "Crime|Drama",
                "popularity": 75.6,
                "vote_average": 9.2,
                "vote_count": 1828102,
                "director": "Francis Ford Coppola",
                "actors": "Marlon Brando, Al Pacino, James Caan"
            },
            {
                "id": 3,
                "imdb_id": "tt0468569",
                "title": "The Dark Knight",
                "overview": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                "poster_path": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
                "release_date": "2008-07-16",
                "genres": "Action|Crime|Drama|Thriller",
                "popularity": 70.8,
                "vote_average": 9.0,
                "vote_count": 2592824,
                "director": "Christopher Nolan",
                "actors": "Christian Bale, Heath Ledger, Aaron Eckhart"
            },
            {
                "id": 4,
                "imdb_id": "tt0110912",
                "title": "Pulp Fiction",
                "overview": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
                "poster_path": "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
                "release_date": "1994-09-10",
                "genres": "Crime|Drama",
                "popularity": 64.3,
                "vote_average": 8.9,
                "vote_count": 2009231,
                "director": "Quentin Tarantino",
                "actors": "John Travolta, Uma Thurman, Samuel L. Jackson"
            },
            {
                "id": 5,
                "imdb_id": "tt0137523",
                "title": "Fight Club",
                "overview": "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
                "poster_path": "https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
                "release_date": "1999-10-15",
                "genres": "Drama",
                "popularity": 63.9,
                "vote_average": 8.8,
                "vote_count": 2083087,
                "director": "David Fincher",
                "actors": "Brad Pitt, Edward Norton, Meat Loaf"
            },
            {
                "id": 6,
                "imdb_id": "tt0816692",
                "title": "Interstellar",
                "overview": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                "poster_path": "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
                "release_date": "2014-11-07",
                "genres": "Adventure|Drama|Sci-Fi",
                "popularity": 61.2,
                "vote_average": 8.7,
                "vote_count": 1828138,
                "director": "Christopher Nolan",
                "actors": "Matthew McConaughey, Anne Hathaway, Jessica Chastain"
            }
        ]
        
        # Insert sample movies into database
        for movie_data in sample_movies:
            release_date = None
            if movie_data.get('release_date'):
                try:
                    release_date = datetime.strptime(movie_data['release_date'], '%Y-%m-%d').date()
                except ValueError:
                    pass
                    
            # Check if movie exists
            existing_movie = Movie.query.filter_by(id=movie_data['id']).first()
            
            if not existing_movie:
                # Create new movie
                new_movie = Movie(
                    id=movie_data['id'],
                    imdb_id=movie_data['imdb_id'],
                    title=movie_data['title'],
                    overview=movie_data['overview'],
                    poster_path=movie_data['poster_path'],
                    release_date=release_date,
                    genres=movie_data['genres'],
                    popularity=movie_data['popularity'],
                    vote_average=movie_data['vote_average'],
                    vote_count=movie_data['vote_count'],
                    director=movie_data['director'],
                    actors=movie_data['actors']
                )
                db.session.add(new_movie)
        
        # Commit all changes
        db.session.commit()
        logger.info(f"Successfully loaded {len(sample_movies)} sample movies")
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error loading sample data: {e}")
        raise


def initialize_recommendation_model():
    """
    Initialize the recommendation model based on content similarity
    """
    global SIMILARITY_MATRIX, MOVIE_INDICES
    
    try:
        # Get all movies from database
        movies = Movie.query.all()
        movies_df = pd.DataFrame([movie.to_dict() for movie in movies])
        
        # Create a feature vector for content-based filtering
        # Combining overview, genres, director and actors for better content matching
        movies_df['features'] = (
            movies_df['overview'].fillna('') + ' ' + 
            movies_df['genres'].fillna('').replace('|', ' ') + ' ' + 
            movies_df['director'].fillna('') + ' ' + 
            movies_df['actors'].fillna('')
        )
        
        # Create TF-IDF vectorizer
        tfidf = TfidfVectorizer(stop_words='english')
        
        # Replace NaN with empty string
        movies_df['features'] = movies_df['features'].fillna('')
        
        # Construct the TF-IDF matrix
        tfidf_matrix = tfidf.fit_transform(movies_df['features'])
        
        # Compute cosine similarity between movies
        SIMILARITY_MATRIX = cosine_similarity(tfidf_matrix)
        
        # Create a mapping of movie IDs to array indices
        MOVIE_INDICES = pd.Series(movies_df.index, index=movies_df['id']).to_dict()
        
        logger.info(f"Successfully initialized recommendation model with {len(movies_df)} movies")
        
    except Exception as e:
        logger.error(f"Error initializing recommendation model: {e}")
        raise


def get_movie_recommendations(movie_id, num_recommendations=6):
    """
    Get content-based movie recommendations based on a given movie
    Args:
        movie_id: ID of the movie to base recommendations on
        num_recommendations: Number of recommendations to return
    Returns:
        List of recommended movie IDs
    """
    global SIMILARITY_MATRIX, MOVIE_INDICES
    
    # If model not initialized, initialize it
    if SIMILARITY_MATRIX is None or MOVIE_INDICES is None:
        initialize_recommendation_model()
    
    try:
        # Get the index of the movie in our dataframe
        idx = MOVIE_INDICES.get(movie_id)
        
        if idx is None:
            logger.warning(f"Movie ID {movie_id} not found in recommendation model")
            return []
        
        # Get similarity scores for all movies with this one
        sim_scores = list(enumerate(SIMILARITY_MATRIX[idx]))
        
        # Sort movies by similarity score
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Get top similar movies (excluding the movie itself)
        sim_scores = sim_scores[1:num_recommendations+1]
        
        # Get movie indices
        movie_indices = [i[0] for i in sim_scores]
        
        # Get all movies from database
        movies = Movie.query.all()
        movies_df = pd.DataFrame([movie.to_dict() for movie in movies])
        
        # Return the movie IDs
        return movies_df.iloc[movie_indices]['id'].tolist()
        
    except Exception as e:
        logger.error(f"Error getting movie recommendations: {e}")
        return []


def get_user_recommendations(user_id, num_recommendations=10):
    """
    Get personalized recommendations for a specific user based on their ratings
    Args:
        user_id: ID of the user to get recommendations for
        num_recommendations: Number of recommendations to return
    Returns:
        List of recommended movie IDs
    """
    from models import Rating
    
    try:
        # Get user's rated movies
        user_ratings = Rating.query.filter_by(user_id=user_id).all()
        
        if not user_ratings:
            logger.warning(f"No ratings found for user {user_id}")
            return []
        
        # Initialize recommendation candidates
        recommendation_candidates = {}
        
        # For each movie the user has rated
        for rating in user_ratings:
            # Get content-based recommendations for this movie
            movie_recs = get_movie_recommendations(rating.movie_id, num_recommendations=5)
            
            # Add recommendations to candidates with weight based on user rating
            for movie_id in movie_recs:
                if movie_id not in [r.movie_id for r in user_ratings]:  # Don't recommend already rated movies
                    if movie_id in recommendation_candidates:
                        recommendation_candidates[movie_id] += rating.rating
                    else:
                        recommendation_candidates[movie_id] = rating.rating
        
        # Sort candidates by score
        sorted_candidates = sorted(recommendation_candidates.items(), key=lambda x: x[1], reverse=True)
        
        # Return top recommendations
        return [movie_id for movie_id, score in sorted_candidates[:num_recommendations]]
        
    except Exception as e:
        logger.error(f"Error getting user recommendations: {e}")
        return []


def search_movies_by_title(title, limit=10):
    """
    Search for movies by title using the OMDb API
    Args:
        title: Movie title to search for
        limit: Maximum number of results to return
    Returns:
        List of movie dictionaries
    """
    try:
        if not OMDB_API_KEY:
            logger.warning("OMDb API key not provided")
            return []
        
        # Build URL for the OMDb API search
        url = f"http://www.omdbapi.com/?s={title}&apikey={OMDB_API_KEY}&type=movie"
        
        # Make the request to the OMDb API
        response = requests.get(url)
        data = response.json()
        
        if data.get('Response') == 'True':
            # Process search results
            results = data.get('Search', [])[:limit]
            
            # For each result, fetch full details
            movies = []
            for item in results:
                imdb_id = item.get('imdbID')
                if imdb_id:
                    # Check if we already have this movie in the database
                    existing_movie = Movie.query.filter_by(imdb_id=imdb_id).first()
                    
                    if existing_movie:
                        movies.append(existing_movie.to_dict())
                    else:
                        # Fetch full details
                        detail_url = f"http://www.omdbapi.com/?i={imdb_id}&apikey={OMDB_API_KEY}&plot=full"
                        detail_response = requests.get(detail_url)
                        detail_data = detail_response.json()
                        
                        if detail_data.get('Response') == 'True':
                            # Process release date
                            release_date = None
                            if detail_data.get('Released') and detail_data.get('Released') != 'N/A':
                                try:
                                    release_date = datetime.strptime(detail_data['Released'], '%d %b %Y').date()
                                except ValueError:
                                    pass
                            
                            # Prepare genres as pipe separated string
                            genres = detail_data.get('Genre', 'N/A').replace(', ', '|')
                            
                            # Extract numeric values
                            imdb_rating = 0.0
                            vote_count = 0
                            if detail_data.get('imdbRating') != 'N/A':
                                imdb_rating = float(detail_data.get('imdbRating', 0))
                            if detail_data.get('imdbVotes') != 'N/A':
                                vote_count = int(detail_data.get('imdbVotes', '0').replace(',', ''))
                            
                            # Create new movie object
                            new_movie = Movie(
                                imdb_id=imdb_id,
                                title=detail_data.get('Title', ''),
                                overview=detail_data.get('Plot', ''),
                                poster_path=detail_data.get('Poster', '') if detail_data.get('Poster') != 'N/A' else '',
                                release_date=release_date,
                                genres=genres,
                                popularity=vote_count / 1000 if vote_count > 0 else 0,
                                vote_average=imdb_rating,
                                vote_count=vote_count,
                                director=detail_data.get('Director', '') if detail_data.get('Director') != 'N/A' else '',
                                actors=detail_data.get('Actors', '') if detail_data.get('Actors') != 'N/A' else ''
                            )
                            db.session.add(new_movie)
                            db.session.commit()
                            
                            # Add to results
                            movies.append(new_movie.to_dict())
                        
                        # Respect rate limiting
                        time.sleep(1)
            
            return movies
            
        else:
            logger.warning(f"No movie found for title '{title}': {data.get('Error')}")
            return []
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error searching movies by title: {e}")
        return []