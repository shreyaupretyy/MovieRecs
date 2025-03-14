"""
Movie recommender system logic
Implementation of content-based filtering with enhanced refresh capabilities
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
import random
from datetime import datetime
import traceback
import os

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
        self.last_model_update = None
        self.refresh_counts = {}  # Track refreshes by user
        self.last_recommendations = {}  # Track recommendations by user
        
    def initialize_recommendation_model(self, force=False):
        """
        Initialize and train the recommendation model
        This doesn't fetch data, just uses what's in the database
        
        Args:
            force: If True, force rebuild even if recently updated
        """
        current_time = datetime.now()
        
        # Skip rebuilding if we've done it recently (within 30 minutes), unless forced
        if (not force and self.last_model_update and 
            (current_time - self.last_model_update).total_seconds() < 1800):
            logger.info(f"Skipping model rebuild - last update was {self.last_model_update}")
            return True
            
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
            
            # Reset movie indices
            self.movie_indices = {}
            
            for i, movie in enumerate(movies):
                # Store movie index mapping
                self.movie_indices[movie.id] = i
                
                # Combine features
                movie_features = []
                
                if movie.title:
                    # Weight title more heavily
                    movie_features.append(movie.title + " " + movie.title)
                    
                if movie.genres:
                    # Replace pipeline separator with spaces and weight genres
                    genres = movie.genres.replace('|', ' ').replace(',', ' ')
                    movie_features.append(genres + " " + genres)
                    
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
                
            # Create TF-IDF vectorizer with improved parameters
            tfidf = TfidfVectorizer(
                stop_words='english',
                max_features=5000,
                ngram_range=(1, 2)  # Include bigrams for better matching
            )
            
            # Generate TF-IDF matrix
            tfidf_matrix = tfidf.fit_transform(features)
            
            # Compute similarity matrix
            self.similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
            
            # Update last model update timestamp
            self.last_model_update = current_time
            
            logger.info(f"Successfully built recommendation model at {self.last_model_update}")
            return True
            
        except Exception as e:
            logger.error(f"Error building recommendation model: {str(e)}")
            logger.error(traceback.format_exc())
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
                self.initialize_recommendation_model()
                if self.similarity_matrix is None:
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
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:limit+20]  # Get extra for diversity
            
            # Add some randomness to the recommendations
            random.shuffle(sim_scores)
            sim_scores = sorted(sim_scores[:limit+10], key=lambda x: x[1], reverse=True)[:limit]
            
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
            logger.error(traceback.format_exc())
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
            
            recommended = unique_recommendations[:limit]
            
            # Store these recommendations for comparison in refresh
            self.last_recommendations[user_id] = {movie.id for movie in recommended}
            
            return recommended
            
        except Exception as e:
            logger.error(f"Error getting user recommendations: {str(e)}")
            logger.error(traceback.format_exc())
            return []

    def refresh_recommendations(self, user_id, limit=5):
        """
        Force a complete refresh of recommendations for a user
        This rebuilds the similarity matrix and gets fresh recommendations
        """
        try:
            # Track refresh count for this user
            self.refresh_counts[user_id] = self.refresh_counts.get(user_id, 0) + 1
            refresh_count = self.refresh_counts[user_id]
            
            logger.info(f"Starting recommendation refresh #{refresh_count} for user {user_id}")
            
            # Force rebuild the recommendation model to ensure we're using the latest data
            force_rebuild = refresh_count % 3 == 1  # Force rebuild every 3rd refresh
            self.initialize_recommendation_model(force=force_rebuild)
            
            # Import the Rating model here to avoid circular imports
            from models import Rating
            
            # Get all of user's ratings
            ratings = Rating.query.filter_by(user_id=user_id).all()
            
            if not ratings:
                logger.info(f"No ratings found for user {user_id} during refresh")
                return []
                
            # Get all rated movie ids
            rated_movie_ids = {r.movie_id for r in ratings}
            
            # Get highly rated movies (rating >= 4.0)
            liked_movies = [r.movie_id for r in ratings if r.rating >= 4.0]
            
            if not liked_movies:
                logger.info(f"No highly rated movies found for user {user_id} during refresh")
                return []
                
            logger.info(f"Found {len(liked_movies)} highly rated movies for user {user_id}")
            
            # Different approach based on refresh count to ensure variety
            all_recommendations = []
            
            # Every other refresh, prioritize different movies
            if refresh_count % 2 == 0:
                # Prioritize recently rated movies
                recent_ratings = sorted(ratings, key=lambda r: r.updated_at if r.updated_at else r.created_at, reverse=True)
                recent_liked = [r.movie_id for r in recent_ratings if r.rating >= 4.0][:3]
                
                for movie_id in recent_liked:
                    recommendations = self.get_recommendations(movie_id, limit=5)
                    all_recommendations.extend(recommendations)
            else:
                # Different approach: use all liked movies but with different random seeds
                random.seed(os.urandom(4))  # Use 4 random bytes as seed
                random.shuffle(liked_movies)
                
                for movie_id in liked_movies[:4]:  # Use first 4 after shuffling
                    recommendations = self.get_recommendations(movie_id, limit=4)
                    all_recommendations.extend(recommendations)
            
            # Ensure we have enough recommendations
            if len(all_recommendations) < limit * 2:
                # Get additional recommendations from other liked movies
                remaining_liked = [m for m in liked_movies if m not in [r.id for r in all_recommendations]]
                random.shuffle(remaining_liked)
                
                for movie_id in remaining_liked:
                    recommendations = self.get_recommendations(movie_id, limit=3)
                    all_recommendations.extend(recommendations)
                    if len(all_recommendations) >= limit * 3:
                        break
            
            # Deduplicate and remove movies the user has already rated
            unique_recommendations = []
            seen_ids = set()
            
            # Check if we have previous recommendations to avoid
            previous_recommendations = self.last_recommendations.get(user_id, set())
            
            # First include some completely new movies
            for movie in all_recommendations:
                if (movie.id not in seen_ids and 
                    movie.id not in rated_movie_ids and
                    movie.id not in previous_recommendations):
                    unique_recommendations.append(movie)
                    seen_ids.add(movie.id)
            
            # If we need more, include some that might have been recommended before
            if len(unique_recommendations) < limit:
                for movie in all_recommendations:
                    if movie.id not in seen_ids and movie.id not in rated_movie_ids:
                        unique_recommendations.append(movie)
                        seen_ids.add(movie.id)
            
            # Apply a complex ranking that changes based on refresh count
            # This ensures different movies rise to the top on each refresh
            if refresh_count % 3 == 0:
                # Standard popularity-based ranking with small random factor
                unique_recommendations.sort(
                    key=lambda x: (x.popularity * 0.9 + random.random() * 0.1), 
                    reverse=True
                )
            elif refresh_count % 3 == 1:
                # Rating-based ranking with moderate random factor
                unique_recommendations.sort(
                    key=lambda x: (x.vote_average * 0.7 + random.random() * 0.3), 
                    reverse=True
                )
            else:
                # Random ranking with year bias (favor newer content)
                current_year = datetime.now().year
                unique_recommendations.sort(
                    key=lambda x: random.random() * 0.7 + (0.3 * (1 if x.release_date and 
                        current_year - x.release_date.year < 10 else 0)),
                    reverse=True
                )
            
            logger.info(f"Generated {len(unique_recommendations)} fresh recommendations for user {user_id}")
            
            # If we still don't have enough recommendations, add some popular movies the user hasn't rated
            if len(unique_recommendations) < limit:
                logger.info("Adding popular movies to recommendations to meet limit")
                popular_movies = self.Movie.query.filter(
                    ~self.Movie.id.in_(rated_movie_ids)
                ).order_by(self.Movie.popularity.desc()).limit(limit).all()
                
                for movie in popular_movies:
                    if movie.id not in seen_ids:
                        unique_recommendations.append(movie)
                        seen_ids.add(movie.id)
            
            # Store this set of recommendations to ensure variety next time
            recommended = unique_recommendations[:limit]
            self.last_recommendations[user_id] = {movie.id for movie in recommended}
            
            return recommended
                
        except Exception as e:
            logger.error(f"Error refreshing recommendations: {str(e)}")
            logger.error(traceback.format_exc())
            return []
    
    def get_model_info(self):
        """Get information about the current recommendation model"""
        return {
            "initialized": self.similarity_matrix is not None,
            "movie_count": len(self.movie_indices) if self.movie_indices else 0,
            "last_update": self.last_model_update.isoformat() if self.last_model_update else None
        }