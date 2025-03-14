# MovieRecs - Personalized Movie Recommendation System

A full-stack movie recommendation application built with React, Flask, and machine learning that helps users discover, track, and rate movies based on their personal preferences.

## What is this project?

MovieRecs is a comprehensive movie recommendation platform that allows users to:
- Explore an extensive database of movies
- Search by title, genre, director, or actors
- Rate and review their watched movies
- Maintain a personal watchlist
- Receive personalized movie recommendations based on their taste
- Track their viewing history and preferences

The application uses a content-based recommendation algorithm that analyzes movie features and user preferences to suggest relevant films that match the user's taste.

## Technologies Used

### Frontend
- **React.js** - Core UI framework
- **React Router** - Navigation and routing
- **Tailwind CSS** - Styling and responsive design
- **Context API** - State management
- **Axios** - API requests
- **FontAwesome** - Icons
- **date-fns** - Date formatting
- **Vite** - Build tool and development server

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **MySQL** - Relational database
- **scikit-learn** - Machine learning algorithms for recommendations
- **TF-IDF** - Text vectorization for content-based filtering
- **NumPy** - Numerical operations
- **Flask-Cors** - Cross-origin resource sharing


## Frontend Setup

```bash
# Clone the repository
git clone https://github.com/shreyaupretyy/MovieRecs.git
cd movie-recs/frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev

## Backend Setup

