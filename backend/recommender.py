"""
Movie recommender system logic
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
from datetime import datetime

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MovieRecommender:
    """Movie recommender class for generating movie recommendations"""
    
    def __init__(self, db, Movie):
        """Initialize with database and Movie model"""
        self.db = db
        self.Movie = Movie
        self.similarity_matrix = None
        self.movie_indices = {}
        
    def initialize_recommendation_model(self):
        """
        Initialize and train the recommendation model
        This doesn't fetch data, just uses what's in the database
        """
        try:
            # Get all movies from database
            movies = self.Movie.query.all()
            
            if not movies:
                logger.warning("No movies in database to build recommendation model")
                return False
                
            logger.info(f"Building recommendation model with {len(movies)} movies")
            
            # Create features for content-based filtering
            # Combine title, overview, genres, director, actors for better recommendations
            features = []
            
            for i, movie in enumerate(movies):
                # Store movie index mapping
                self.movie_indices[movie.id] = i
                
                # Combine features
                movie_features = []
                
                if movie.title:
                    movie_features.append(movie.title)
                    
                if movie.genres:
                    # Replace pipeline separator with spaces
                    genres = movie.genres.replace('|', ' ')
                    movie_features.append(genres)
                    
                if movie.director:
                    movie_features.append(movie.director)
                    
                if movie.actors:
                    movie_features.append(movie.actors)
                    
                if movie.overview:
                    movie_features.append(movie.overview)
                    
                features.append(' '.join(movie_features).lower())
            
            # Check if we have enough data to proceed
            if not features:
                logger.warning("No valid features found for movies")
                return False
                
            # Create TF-IDF vectorizer
            tfidf = TfidfVectorizer(stop_words='english')
            
            # Generate TF-IDF matrix
            tfidf_matrix = tfidf.fit_transform(features)
            
            # Compute similarity matrix
            self.similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
            
            logger.info("Successfully built recommendation model")
            return True
            
        except Exception as e:
            logger.error(f"Error building recommendation model: {str(e)}")
            return False
            
    def get_recommendations(self, movie_id, limit=5):
        """
        Get movie recommendations based on a movie ID
        Returns a list of movie objects
        """
        try:
            # Check if model is initialized
            if self.similarity_matrix is None:
                logger.warning("Recommendation model not initialized")
                return []
                
            # Check if the movie exists in our mapping
            if movie_id not in self.movie_indices:
                logger.warning(f"Movie ID {movie_id} not found in recommendation model")
                return []
                
            # Get the index of the movie
            idx = self.movie_indices[movie_id]
            
            # Get similarity scores for the movie
            sim_scores = list(enumerate(self.similarity_matrix[idx]))
            
            # Sort movies by similarity score (excluding the movie itself)
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:limit+1]
            
            # Get movie IDs
            movie_indices = [i[0] for i in sim_scores]
            
            # Get movie objects
            recommended_movies = []
            all_movies = self.Movie.query.all()
            
            for idx in movie_indices:
                if idx < len(all_movies):
                    recommended_movies.append(all_movies[idx])
            
            return recommended_movies
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            return []
            
    def get_user_recommendations(self, user_id, limit=5):
        """
        Get movie recommendations based on user's past ratings
        Returns a list of movie objects
        """
        try:
            from models import Rating
            
            # Get user's ratings
            ratings = Rating.query.filter_by(user_id=user_id).all()
            
            if not ratings:
                logger.info(f"No ratings found for user {user_id}")
                return []
                
            # Get highly rated movies (rating >= 4.0)
            liked_movies = [r.movie_id for r in ratings if r.rating >= 4.0]
            
            if not liked_movies:
                logger.info(f"No highly rated movies found for user {user_id}")
                return []
                
            # Get recommendations based on liked movies
            all_recommendations = []
            
            for movie_id in liked_movies:
                recommendations = self.get_recommendations(movie_id, limit=3)
                all_recommendations.extend(recommendations)
                
            # Deduplicate and remove movies the user has already rated
            rated_movie_ids = {r.movie_id for r in ratings}
            unique_recommendations = []
            seen_ids = set()
            
            for movie in all_recommendations:
                if movie.id not in seen_ids and movie.id not in rated_movie_ids:
                    unique_recommendations.append(movie)
                    seen_ids.add(movie.id)
                    
            # Sort by popularity and limit the results
            unique_recommendations.sort(key=lambda x: x.popularity, reverse=True)
            return unique_recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error getting user recommendations: {str(e)}")
            return []