# MovieRecs: Personalized Movie Recommendation System

## Project Overview
MovieRecs is a full-stack web application that helps users discover movies based on their preferences. The system analyzes user ratings and movie characteristics to provide personalized recommendations using collaborative filtering techniques.

## Key Features
- **Movie Discovery**: Browse a vast library of movies with detailed information.
- **Advanced Search**: Filter movies by title, genre, release date, and more.
- **Personalized Recommendations**: Get tailored movie suggestions based on your ratings.
- **User Profiles**: Create accounts, rate movies, and maintain a watchlist.
- **Responsive Design**: Seamless experience across desktop and mobile devices.

## Tech Stack
### Backend
- **Flask**: Python web framework for the RESTful API.
- **SQLAlchemy**: ORM for database operations.
- **MySQL**: Database for storing movie and user information.
- **Scikit-learn**: Machine learning library for the recommendation engine.

### Frontend
- **React**: JavaScript library for building the user interface.
- **React Router**: For handling client-side routing.
- **Axios**: For making HTTP requests to the backend API.
- **TailwindCSS**: Utility-first CSS framework for styling.

---

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- MySQL 8.0+

### Backend Setup
1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/movie-recommender.git
   cd movie-recommender
   ```
2. **Create and activate a virtual environment**
   ```sh
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```
3. **Install backend dependencies**
   ```sh
   cd backend
   pip install -r requirements.txt
   ```
4. **Set up the database**
   ```sh
   # Create and initialize the MySQL database
   mysql -u root -p < database_setup.sql
   ```
5. **Configure environment variables**
   ```sh
   # Create a .env file in the backend directory
   echo "DATABASE_URI=mysql+mysqlconnector://username:password@localhost/movie_recommender_db
   SECRET_KEY=your_secret_key
   OMDB_API_KEY=your_omdb_api_key" > .env
   ```
6. **Run the backend server**
   ```sh
   flask run --debug
   # The API will be available at http://localhost:5000
   ```

### Frontend Setup
1. **Install frontend dependencies**
   ```sh
   cd ../frontend
   npm install
   ```
2. **Configure environment variables**
   ```sh
   # Create a .env file in the frontend directory
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```
3. **Run the development server**
   ```sh
   npm run dev
   # The application will be available at http://localhost:5173
   ```

---

## API Documentation

### Movies
- `GET /api/movies` - Get paginated list of movies
- `GET /api/movies/:id` - Get details of a specific movie
- `GET /api/movies/search` - Search movies by title, genre, etc.

### Recommendations
- `GET /api/recommendations/:movie_id` - Get movie recommendations based on a movie
- `GET /api/recommendations/user/:user_id` - Get personalized recommendations for a user

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate a user
- `GET /api/users/:id/ratings` - Get ratings by a user

### Ratings
- `POST /api/ratings` - Submit a movie rating
- `PUT /api/ratings/:id` - Update a rating
- `DELETE /api/ratings/:id` - Delete a rating

---

## Database Schema

### Movies Table
| Column        | Type     | Description                     |
|--------------|---------|---------------------------------|
| id           | INT     | Primary key                     |
| imdb_id      | VARCHAR | IMDB identifier                 |
| title        | VARCHAR | Movie title                     |
| overview     | TEXT    | Plot summary                    |
| poster_path  | VARCHAR | URL to poster image             |
| release_date | DATE    | Release date                    |
| genres       | VARCHAR | Pipe-separated genre list       |
| popularity   | FLOAT   | Popularity score                |
| vote_average | FLOAT   | Average vote score              |
| vote_count   | INT     | Number of votes                 |
| director     | VARCHAR | Director name(s)                |
| actors       | VARCHAR | Main cast members               |

### Users Table
| Column      | Type     | Description                    |
|------------|---------|--------------------------------|
| id         | INT     | Primary key                    |
| username   | VARCHAR | Unique username                |
| email      | VARCHAR | Unique email address           |
| password_hash | VARCHAR | Hashed password            |
| created_at | DATETIME | Account creation timestamp    |

### Ratings Table
| Column    | Type     | Description                     |
|----------|---------|---------------------------------|
| id       | INT     | Primary key                     |
| user_id  | INT     | Foreign key to users table      |
| movie_id | INT     | Foreign key to movies table     |
| rating   | FLOAT   | Rating value (1-5)              |
| created_at | DATETIME | Rating timestamp             |

---

## Recommendation Algorithm
The system uses a hybrid recommendation approach:
- **Collaborative Filtering**: Recommends movies based on similar users' preferences.
- **Content-Based Filtering**: Recommends movies with similar characteristics to those the user has rated highly.
- **Popularity-Based**: For new users with few ratings, popular movies are recommended.

## Future Enhancements
- **Watchlist**: Allow users to save movies they want to watch.
- **Advanced Recommendation**: Implement matrix factorization for better recommendations.
- **Social Features**: Follow friends and see their recommendations.
- **Reviews**: Enable users to write and read movie reviews.
- **Streaming Information**: Show where movies are available to stream.

---

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements
- Movie information from [OMDb API](https://www.omdbapi.com/)
- Icons from [Heroicons](https://heroicons.com/)
- UI components inspired by [TailwindUI](https://tailwindui.com/)

---
