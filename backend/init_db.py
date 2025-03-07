from app import app, db
from models import Movie, User, Rating
import recommender

def init_database():
    """Initialize database tables and load sample data"""
    print("Creating database tables...")
    with app.app_context():
        db.create_all()
        
        # Check if we have movies in the database
        if Movie.query.count() == 0:
            print("Loading initial movie data...")
            recommender.load_initial_data()
            print("Done loading movie data.")
        else:
            print("Database already contains movie data.")
        
    print("Database initialization complete.")

if __name__ == "__main__":
    init_database()