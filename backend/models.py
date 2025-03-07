from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    ratings = db.relationship('Rating', backref='user', lazy=True, cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Movie(db.Model):
    __tablename__ = 'movies'
    
    id = db.Column(db.Integer, primary_key=True)
    imdb_id = db.Column(db.String(20), unique=True)  # Changed from tmdb_id to imdb_id
    title = db.Column(db.String(200), nullable=False)
    overview = db.Column(db.Text)  # Contains the plot from OMDb
    poster_path = db.Column(db.String(300))  # Full URL to poster from OMDb
    release_date = db.Column(db.Date)
    genres = db.Column(db.String(200))  # Pipe-separated genres
    popularity = db.Column(db.Float, default=0)  # Calculated from vote count
    vote_average = db.Column(db.Float, default=0)  # IMDb rating
    vote_count = db.Column(db.Integer, default=0)  # IMDb vote count
    director = db.Column(db.String(200))  # New field for director(s)
    actors = db.Column(db.String(500))  # New field for main actors
    
    ratings = db.relationship('Rating', backref='movie', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
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
            'actors': self.actors
        }


class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'movie_id': self.movie_id,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }