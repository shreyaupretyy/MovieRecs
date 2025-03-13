"""
Database models for the movie recommender application
"""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize SQLAlchemy
db = SQLAlchemy()

class Movie(db.Model):
    """Movie model representing a movie in the database"""
    __tablename__ = 'movies'
    
    id = db.Column(db.Integer, primary_key=True)
    tmdb_id = db.Column(db.String(20), nullable=True)
    imdb_id = db.Column(db.String(20), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    overview = db.Column(db.Text, nullable=True)
    poster_path = db.Column(db.String(255), nullable=True)
    release_date = db.Column(db.Date, nullable=True)
    genres = db.Column(db.String(255), nullable=True)
    popularity = db.Column(db.Float, default=0.0)
    vote_average = db.Column(db.Float, default=0.0)
    vote_count = db.Column(db.Integer, default=0)
    director = db.Column(db.String(255), nullable=True)
    actors = db.Column(db.String(255), nullable=True)
    data_source = db.Column(db.String(20), default="unknown")  # 'omdb' or 'sample'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define unique constraint that combines imdb_id and data_source
    # This allows the same movie to exist from different data sources
    __table_args__ = (
        db.UniqueConstraint('imdb_id', 'data_source', name='unique_movie_source'),
    )
    
    def __repr__(self):
        return f'<Movie {self.title}>'
    
    def to_dict(self):
        """Convert movie object to dictionary"""
        return {
            'id': self.id,
            'tmdb_id': self.tmdb_id,
            'imdb_id': self.imdb_id,
            'title': self.title,
            'overview': self.overview,
            'poster_path': self.poster_path,
            'release_date': self.release_date.isoformat() if self.release_date else None,
            'genres': self.genres,
            'popularity': self.popularity,
            'vote_average': self.vote_average,
            'vote_count': self.vote_count,
            'director': self.director,
            'actors': self.actors,
            'data_source': self.data_source
        }

class User(db.Model):
    """User model representing a user in the database"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Define relationship using back_populates to avoid duplicate backrefs.
    ratings = db.relationship('Rating', back_populates='user', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if password is correct"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user object to dictionary (exclude password)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Float, nullable=False)  # This is the rating value (0.5 to 5.0)
    review = db.Column(db.Text, nullable=True)  # Optional text review
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('ratings', lazy=True, cascade="all, delete-orphan"))
    movie = db.relationship('Movie', backref=db.backref('ratings', lazy=True, cascade="all, delete-orphan"))
    
    def to_dict(self):
        """Convert rating object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'movie_id': self.movie_id,
            'rating': self.rating,  # Use 'rating' consistently
            'review': self.review,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }