"""
OMDb Service - Handles all interactions with OMDb API
This is a separate service file that won't run until explicitly called
"""
import os
import time
import requests
from datetime import datetime
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import models only when needed to avoid circular imports
def fetch_and_store_movies(db, Movie, force_refresh=False):
    """
    Fetch movies from OMDb API and store in database
    Returns a dict with status and message
    """
    # List of popular movie IMDb IDs to fetch
    POPULAR_MOVIE_IMDB_IDS = [
        # Top rated movies
        'tt0111161',  # The Shawshank Redemption
        'tt0068646',  # The Godfather
        'tt0071562',  # The Godfather Part II
        'tt0468569',  # The Dark Knight
        'tt0050083',  # 12 Angry Men
        'tt0108052',  # Schindler's List
        'tt0167260',  # The Lord of the Rings: The Return of the King
        'tt0110912',  # Pulp Fiction
        'tt0060196',  # The Good, the Bad and the Ugly
        'tt0109830',  # Forrest Gump
        'tt0120737',  # The Lord of the Rings: The Fellowship of the Ring
        'tt0137523',  # Fight Club
        'tt0080684',  # Star Wars: Episode V - The Empire Strikes Back
        'tt1375666',  # Inception
        'tt0167261',  # The Lord of the Rings: The Two Towers
        'tt0133093',  # The Matrix
        'tt0099685',  # Goodfellas
        'tt0073486',  # One Flew Over the Cuckoo's Nest
        'tt0047478',  # Seven Samurai
        'tt0114369',  # Se7en
        'tt0102926',  # The Silence of the Lambs
        'tt0038650',  # It's a Wonderful Life
        'tt0076759',  # Star Wars
        'tt0120815',  # Saving Private Ryan
        'tt0245429',  # Spirited Away
        'tt0120689',  # The Green Mile
        'tt0816692',  # Interstellar
        'tt0110413',  # Léon: The Professional
        'tt0114814',  # The Usual Suspects
        'tt0056058',  # Harakiri
        'tt0110357',  # The Lion King
        'tt0120586',  # American History X
        'tt0253474',  # The Pianist
        'tt0103064',  # Terminator 2: Judgment Day
        'tt0088763',  # Back to the Future
        'tt2582802',  # Whiplash
        'tt0114709',  # Toy Story
        'tt0056592',  # To Kill a Mockingbird
        'tt0054215',  # Psycho
        'tt0095765',  # Cinema Paradiso
        'tt0172495',  # Gladiator
        'tt0338013',  # Eternal Sunshine of the Spotless Mind
        'tt0211915',  # Amélie
        'tt0209144',  # Memento
        'tt0482571',  # The Prestige
        'tt0407887',  # The Departed
        'tt0405094',  # The Lives of Others
        'tt0169547',  # American Beauty
        'tt0372784',  # Batman Begins
        'tt0361748',  # Inglourious Basterds
        'tt0180093',  # Requiem for a Dream
        'tt0119217',  # Good Will Hunting
        'tt0435761',  # Toy Story 3
        'tt1345836',  # The Dark Knight Rises
        'tt1675434',  # The Intouchables
        'tt0364569',  # Oldboy
        'tt0317248',  # City of God
        'tt0052357',  # Vertigo
        'tt0081505',  # The Shining
        'tt0033467',  # Citizen Kane
        'tt0027977',  # Modern Times
        'tt0064116',  # Once Upon a Time in the West
        'tt0053125',  # North by Northwest
        'tt0021749',  # City Lights
        'tt0057012',  # Dr. Strangelove
        'tt0078788',  # Apocalypse Now
        'tt0082971',  # Raiders of the Lost Ark
        'tt0078748',  # Alien
        'tt0032553',  # The Great Dictator
        'tt0036775',  # Double Indemnity
        'tt0046912',  # Rear Window
        'tt0053604',  # The Apartment
        'tt0022100',  # M
        'tt0086190',  # Star Wars: Episode VI - Return of the Jedi
        'tt0062622',  # 2001: A Space Odyssey
        'tt0075314',  # Taxi Driver
        'tt0040522',  # Bicycle Thieves
        'tt0086879',  # Amadeus
        'tt0090605',  # Aliens
        'tt0087843',  # Once Upon a Time in America
        'tt0119698',  # Princess Mononoke
        'tt0095327',  # Grave of the Fireflies
        'tt0082096',  # Das Boot
        'tt0091251',  # Come and See
        'tt0112573',  # Braveheart
        'tt0105236',  # Reservoir Dogs
        'tt0086250',  # Scarface
        'tt0097576',  # Indiana Jones and the Last Crusade
        'tt0112641',  # Casino
        'tt0091763',  # Platoon
        'tt0093058',  # Full Metal Jacket
        'tt0095016',  # Die Hard
        'tt0119488',  # L.A. Confidential
        'tt0087884',  # Terminator
        'tt0084787',  # The Thing
        'tt0097165',  # Dead Poets Society
        'tt0093779',  # The Princess Bride
        'tt0325980',  # Pirates of the Caribbean: The Curse of the Black Pearl
        'tt0266697',  # Kill Bill: Vol. 1
        'tt0266543',  # Finding Nemo
        'tt0246578',  # Donnie Darko
        'tt0449059',  # Little Miss Sunshine
        'tt0434409',  # V for Vendetta
        'tt0307901',  # Oldboy
        'tt0443706',  # Zodiac
        'tt0401792',  # Sin City
        'tt0432283',  # The Cabin in the Woods
        'tt1130884',  # Shutter Island
        'tt0477348',  # No Country for Old Men
        'tt1392170',  # The Hunger Games
        'tt0381061',  # Casino Royale
        'tt1201607',  # Harry Potter and the Deathly Hallows: Part 2
        'tt1853728',  # Django Unchained
        'tt0198781',  # Monsters, Inc.
        'tt0317705',  # The Incredibles
        'tt0382932',  # Ratatouille
        'tt0441773',  # Kung Fu Panda
        'tt0892769',  # How to Train Your Dragon
        'tt0347149',  # Howl's Moving Castle
        'tt1049413',  # Up
        'tt0910970',  # WALL·E
        'tt0126029',  # Shrek
        'tt0319343',  # Big Fish
        'tt2948356',  # Zootopia
        'tt2380307',  # Coco
        'tt1632708',  # Wreck-It Ralph
        'tt0398286',  # Tangled
        'tt0097757',  # The Little Mermaid
        'tt0096283',  # My Neighbor Totoro
        'tt2096673',  # Inside Out
        'tt0058331',  # Mary Poppins
        'tt5311514',  # Your Name
        'tt0499549',  # Avatar
        'tt0371724',  # The Hitchhiker's Guide to the Galaxy
        'tt0088247',  # The Terminator
        'tt0088258',  # Brazil
        'tt0206634',  # Children of Men
        'tt0379786',  # Serenity
        'tt0120201',  # Starship Troopers
        'tt0083658',  # Blade Runner
        'tt0470752',  # Ex Machina
        'tt0379725',  # Battlestar Galactica
        'tt0107290',  # Jurassic Park
        'tt0848228',  # The Avengers
        'tt3498820',  # Captain America: Civil War
        'tt0118929',  # The Fifth Element
        'tt0796366',  # Star Trek
        'tt1392190',  # Mad Max: Fury Road
        'tt1179933',  # Hooking Up
        'tt0167404',  # The Sixth Sense
        'tt0144084',  # American Psycho
        'tt0071315',  # Chinatown
        'tt0208092',  # Snatch
        'tt0426883',  # Saw II
        'tt0365748',  # Shaun of the Dead
        'tt0993846',  # The Wolf of Wall Street
        'tt0166924',  # Mulholland Drive
        'tt0117951',  # Trainspotting
        'tt0381681',  # Before Sunset
        'tt0181689',  # Minority Report
        'tt0425112',  # Hot Fuzz
        'tt0120338',  # Titanic
        'tt0075148',  # Rocky
        'tt0268978',  # A Beautiful Mind
        'tt0112471',  # Before Sunrise
        'tt0469494',  # There Will Be Blood
        'tt0046268',  # Roman Holiday
        'tt0454876',  # The Pursuit of Happyness
        'tt0405159',  # Million Dollar Baby
        'tt1010048',  # Slumdog Millionaire
        'tt0421715',  # The Curious Case of Benjamin Button
        'tt1187043',  # 3 Idiots
        'tt0405508',  # Rang De Basanti
        'tt0071853',  # Monty Python and the Holy Grail
        'tt0118715',  # The Big Lebowski
        'tt0116282',  # Fargo
        'tt0440963',  # The Bourne Ultimatum
        'tt0107048',  # Groundhog Day
        'tt0070735',  # The Sting
        'tt0443453',  # Borat
        'tt0116231',  # The Hunchback of Notre Dame
        'tt0113277',  # Heat
        'tt0363163',  # Downfall
        'tt0289879',  # Aqua Teen Hunger Force
        'tt0758758',  # Into the Wild
        'tt0455944',  # The Wicker Man
        'tt0045152',  # Singin' in the Rain
        'tt0056172',  # Lawrence of Arabia
        'tt0034583',  # Casablanca
        'tt0052618',  # Ben-Hur
        'tt0041959',  # The Third Man
        'tt0043014',  # Sunset Blvd.
        'tt0057115',  # The Great Escape
        'tt0047396',  # Rear Window
        'tt0050212',  # The Bridge on the River Kwai
        'tt0081398',  # Raging Bull
        'tt0040897',  # The Treasure of the Sierra Madre
        'tt0042876',  # Rashomon
        'tt0051201',  # Witness for the Prosecution
        'tt0044079',  # A Streetcar Named Desire
        'tt0031381',  # Gone with the Wind
        'tt0053291',  # Some Like It Hot
        'tt0041546',  # The Third Man
        'tt8946378',  # Knives Out
        'tt3315342',  # Logan
        'tt2267998',  # Gone Girl
        'tt2015381',  # Guardians of the Galaxy
        'tt1856101',  # Blade Runner 2049
        'tt5013056',  # Dunkirk
        'tt5027774',  # Three Billboards Outside Ebbing, Missouri
        'tt1631867',  # Edge of Tomorrow
        'tt1485796',  # The Greatest Showman
        'tt6751668',  # Parasite
        'tt7286456',  # Joker
        'tt1160419',  # Dune
        'tt4154756',  # Avengers: Infinity War
        
        # Additional 150 movies (new entries)
        'tt0118799',  # Life Is Beautiful
        'tt0457430',  # Pan's Labyrinth
        'tt0076538',  # Annie Hall
        'tt0116695',  # Independence Day
        'tt1302006',  # The Spectacular Now
        'tt0118849',  # Boogie Nights
        'tt1951264',  # The Hunger Games: Catching Fire
        'tt0448134',  # Pineapple Express
        'tt0089881',  # The Goonies
        'tt0942385',  # Tropic Thunder
        'tt1431045',  # Deadpool
        'tt0056801',  # 8½
        'tt0241527',  # Harry Potter and the Sorcerer's Stone
        'tt0458339',  # Captain America: The First Avenger
        'tt0268695',  # A Walk to Remember
        'tt0790636',  # Dallas Buyers Club
        'tt0116384',  # The Rock
        'tt0446029',  # Scott Pilgrim vs. the World
        'tt0367110',  # Sweeney Todd: The Demon Barber of Fleet Street
        'tt2582782',  # Hell or High Water
        'tt0418279',  # Troy
        'tt0414387',  # Pride & Prejudice
        'tt0117060',  # Mission: Impossible
        'tt0332280',  # The Notebook
        'tt0375679',  # Crash
        'tt0373889',  # Harry Potter and the Order of the Phoenix
        'tt1130988',  # Transformers: Dark of the Moon
        'tt0117571',  # Scream
        'tt0217869',  # Bridget Jones's Diary
        'tt0442933',  # Stardust
        'tt0477347',  # Night at the Museum
        'tt0409459',  # Watchmen
        'tt0077631',  # Halloween
        'tt2278388',  # The Grand Budapest Hotel
        'tt0831387',  # Godzilla
        'tt0367882',  # Indiana Jones and the Kingdom of the Crystal Skull
        'tt0134084',  # Bridget Jones: The Edge of Reason
        'tt2543164',  # Arrival
        'tt2488496',  # Star Wars: Episode VII - The Force Awakens
        'tt0467406',  # Juno
        'tt0317740',  # The Italian Job
        'tt0116629',  # Independence Day
        'tt0120903',  # X-Men
        'tt0120755',  # Mission: Impossible II
        'tt0387564',  # Saw
        'tt0478970',  # Ant-Man
        'tt2179136',  # American Hustle
        'tt0887883',  # Burn After Reading
        'tt1343727',  # The Muppets
        'tt0120616',  # The Mummy
        'tt0298148',  # Shrek 2
        'tt0361862',  # The Incredibles
        'tt0120623',  # A Bug's Life
        'tt0367594',  # Charlie and the Chocolate Factory
        'tt0499097',  # War of the Worlds
        'tt0213149',  # Pearl Harbor
        'tt0780536',  # Drive
        'tt0073195',  # Jaws
        'tt0363771',  # The Chronicles of Narnia: The Lion, the Witch and the Wardrobe
        'tt2024544',  # 12 Years a Slave
        'tt1950186',  # Ford v Ferrari
        'tt1170358',  # The Hobbit: The Desolation of Smaug
        'tt1905041',  # Fast & Furious 6
        'tt0185937',  # Chicken Run
        'tt3397884',  # Sicario
        'tt1877832',  # X-Men: Days of Future Past
        'tt0120630',  # Chicken Run
        'tt1454029',  # Gravity
        'tt1156398',  # Zombieland
        'tt0795421',  # Mamma Mia!
        'tt0106918',  # The Nightmare Before Christmas
        'tt0473075',  # Deja Vu
        'tt1022603',  # 500 Days of Summer
        'tt0145487',  # Spider-Man
        'tt0330373',  # Harry Potter and the Goblet of Fire
        'tt0945513',  # Source Code
        'tt0117705',  # Space Jam
        'tt0120363',  # Toy Story 2
        'tt0234215',  # The Matrix Reloaded
        'tt1798709',  # Her
        'tt0109686',  # Dumb and Dumber
        'tt0486655',  # Rec
        'tt3783958',  # La La Land
        'tt0265086',  # Black Hawk Down
        'tt0120655',  # Notting Hill
        'tt0116367',  # From Dusk Till Dawn
        'tt0096874',  # Back to the Future Part II
        'tt0190590',  # O Brother, Where Art Thou?
        'tt0120863',  # The Truman Show
        'tt0120915',  # Star Wars: Episode I - The Phantom Menace
        'tt1340138',  # Hachi: A Dog's Tale
        'tt0162222',  # Cast Away
        'tt0397892',  # Bolt
        'tt0104431',  # A League of Their Own
        'tt1300854',  # Iron Man 3
        'tt0376994',  # X-Men: The Last Stand
        'tt0120912',  # Men in Black II
        'tt0186566',  # Frequency
        'tt0121765',  # Star Wars: Episode II - Attack of the Clones
        'tt0120685',  # Godzilla
        'tt0903624',  # The Hobbit: An Unexpected Journey
        'tt1298650',  # Pirates of the Caribbean: On Stranger Tides
        'tt0332452',  # Troy
        'tt0317219',  # Cars
        'tt0119654',  # Men in Black
        'tt0371746',  # Iron Man
        'tt0295297',  # Harry Potter and the Chamber of Secrets
        'tt0479952',  # Madagascar: Escape 2 Africa
        'tt0258463',  # The Bourne Identity
        'tt0120667',  # Fantastic Four
        'tt0814314',  # I Am Legend
        'tt0240772',  # Ocean's Eleven
        'tt0293508',  # Bowling for Columbine
        'tt0117998',  # Twister
        'tt0369610',  # Jurassic World
        'tt0146882',  # High Fidelity
        'tt1074638',  # Skyfall
        'tt0369339',  # Begin Again
        'tt0116996',  # Mars Attacks!
        'tt0449088',  # Pirates of the Caribbean: At World's End
        'tt0209163',  # Memento
        'tt0119116',  # The Fifth Element
        'tt1979320',  # Rush
        'tt0315327',  # Bruce Almighty
        'tt1637725',  # In Time
        'tt0116213',  # The English Patient
        'tt0377981',  # Mean Girls
        'tt0120663',  # Eyes Wide Shut
        'tt1320253',  # The Expendables
        'tt0119164',  # The Game
        'tt0417741',  # Harry Potter and the Half-Blood Prince
    ]
    
    # Deduplicate IMDb IDs so each unique movie is fetched only once
    unique_imdb_ids = list(dict.fromkeys(POPULAR_MOVIE_IMDB_IDS))
    total_unique_ids = len(unique_imdb_ids)
    logger.info(f"Total unique IMDb IDs to fetch: {total_unique_ids}")
    
    try:
        # Check if API key is available
        api_key = os.environ.get('OMDB_API_KEY')
        if not api_key:
            logger.error("OMDB_API_KEY not set in environment variables")
            return {
                "status": "error",
                "message": "OMDb API key not configured in environment variables"
            }
        
        # Counter for successful fetches
        successful_fetches = 0
        replaced_sample_movies = 0
        skipped_existing = 0
        failed_fetches = 0
        total_processed = 0
        
        # If force_refresh is True, clear existing API-sourced movies
        if force_refresh:
            try:
                deleted = Movie.query.filter_by(data_source="omdb").delete()
                db.session.commit()
                logger.info(f"Cleared {deleted} existing movies from OMDb API")
            except Exception as e:
                db.session.rollback()
                logger.error(f"Error clearing existing movies: {e}")
                
        # Fetch data for each movie in our list of unique IMDb IDs
        for index, imdb_id in enumerate(unique_imdb_ids):
            total_processed += 1
            try:
                if total_processed % 10 == 0:
                    logger.info(f"Progress: {total_processed}/{total_unique_ids} movies processed")
                
                # Check if movie already exists from the API source
                existing_api_movie = Movie.query.filter_by(
                    imdb_id=imdb_id, 
                    data_source="omdb"
                ).first()
                
                # Check if a sample movie with the same IMDb ID exists
                sample_movie = Movie.query.filter_by(
                    imdb_id=imdb_id,
                    data_source="sample"
                ).first()
                
                # Skip if the movie is already in the database as an API movie and we're not forcing refresh
                if existing_api_movie and not force_refresh:
                    logger.info(f"Movie {imdb_id} already exists as API movie in database, skipping")
                    skipped_existing += 1
                    continue

                # Build URL for the OMDb API request
                url = f"http://www.omdbapi.com/?i={imdb_id}&apikey={api_key}&plot=full"
                logger.info(f"Fetching data for movie {imdb_id} from OMDb API ({index+1}/{total_unique_ids})")
                
                # Make the request to the OMDb API
                response = requests.get(url, timeout=10)
                
                if response.status_code != 200:
                    logger.error(f"Failed to fetch data for {imdb_id}. Status code: {response.status_code}")
                    failed_fetches += 1
                    continue
                    
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
                    
                    # If a sample movie with the same IMDb ID exists, delete it
                    if sample_movie:
                        logger.info(f"Found sample movie {imdb_id}, replacing with API data")
                        db.session.delete(sample_movie)
                        db.session.commit()
                        replaced_sample_movies += 1
                    
                    # Create new movie object or update existing one
                    if existing_api_movie and force_refresh:
                        # Update existing movie
                        existing_api_movie.tmdb_id = movie_data.get('imdbID', '').replace('tt', '')
                        existing_api_movie.title = movie_data.get('Title', '')
                        existing_api_movie.overview = movie_data.get('Plot', '')
                        existing_api_movie.poster_path = movie_data.get('Poster', '') if movie_data.get('Poster') != 'N/A' else ''
                        existing_api_movie.release_date = release_date
                        existing_api_movie.genres = genres
                        existing_api_movie.popularity = vote_count / 1000 if vote_count > 0 else 0
                        existing_api_movie.vote_average = imdb_rating
                        existing_api_movie.vote_count = vote_count
                        existing_api_movie.director = movie_data.get('Director', '') if movie_data.get('Director') != 'N/A' else ''
                        existing_api_movie.actors = movie_data.get('Actors', '') if movie_data.get('Actors') != 'N/A' else ''
                        existing_api_movie.updated_at = datetime.utcnow()
                        db.session.commit()
                        logger.info(f"Updated existing API movie: {existing_api_movie.title}")
                    else:
                        # Create new movie
                        new_movie = Movie(
                            tmdb_id=movie_data.get('imdbID', '').replace('tt', ''),
                            imdb_id=movie_data.get('imdbID', ''),
                            title=movie_data.get('Title', '')[:255],  # Ensure title fits in database field
                            overview=movie_data.get('Plot', '')[:2000] if movie_data.get('Plot') else '',  # Limit overview length
                            poster_path=movie_data.get('Poster', '') if movie_data.get('Poster') != 'N/A' else '',
                            release_date=release_date,
                            genres=genres,
                            popularity=vote_count / 1000 if vote_count > 0 else 0,
                            vote_average=imdb_rating,
                            vote_count=vote_count,
                            director=movie_data.get('Director', '')[:255] if movie_data.get('Director') != 'N/A' else '',
                            actors=movie_data.get('Actors', '')[:500] if movie_data.get('Actors') != 'N/A' else '',
                            data_source="omdb"  # Mark this as coming from OMDb API
                        )
                        db.session.add(new_movie)
                        db.session.commit()
                        logger.info(f"Successfully added API movie: {new_movie.title}")
                    
                    successful_fetches += 1
                else:
                    logger.warning(f"Failed to fetch data for IMDb ID {imdb_id}: {movie_data.get('Error')}")
                    failed_fetches += 1
                
                # Respect rate limiting with small delay
                time.sleep(0.5)
                
            except Exception as e:
                db.session.rollback()
                logger.error(f"Error processing movie {imdb_id}: {str(e)}")
                failed_fetches += 1
                # Continue with the next movie
                
                # Try not to overwhelm the API with too many requests in case of errors
                time.sleep(1)
        
        # Summary logging
        logger.info(f"Processing complete: Total unique IDs: {total_unique_ids}")
        logger.info(f"Successfully fetched and stored: {successful_fetches}")
        logger.info(f"Replaced sample movies: {replaced_sample_movies}")
        logger.info(f"Skipped (already exist): {skipped_existing}")
        logger.info(f"Failed fetches: {failed_fetches}")
        
        if successful_fetches > 0:
            message = f"Successfully added {successful_fetches} movies from OMDb API"
            if replaced_sample_movies > 0:
                message += f" and replaced {replaced_sample_movies} sample movies"
                
            # Add details about skipped and failed movies
            if skipped_existing > 0:
                message += f". {skipped_existing} movies were already in database"
            if failed_fetches > 0:
                message += f". {failed_fetches} movies failed to fetch"
                
            return {
                "status": "success",
                "message": message,
                "count": successful_fetches,
                "replaced": replaced_sample_movies,
                "skipped": skipped_existing,
                "failed": failed_fetches,
                "total_processed": total_processed,
                "total_unique": total_unique_ids
            }
        else:
            return {
                "status": "warning",
                "message": f"No new movies were added from OMDb API. {skipped_existing} already existed, {failed_fetches} failed to fetch.",
                "skipped": skipped_existing,
                "failed": failed_fetches
            }
        
    except Exception as e:
        logger.error(f"Error in fetch_and_store_movies: {str(e)}")
        return {
            "status": "error",
            "message": f"Error fetching movies: {str(e)}"
        }

def load_sample_data(db, Movie):
    """
    Load sample movie data as a fallback
    Returns a dict with status and message
    """
    try:
        # Sample movies data
        sample_movies = [
            {
                "title": "Inception",
                "overview": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                "release_date": "2010-07-16",
                "genres": "Action|Adventure|Science Fiction|Thriller",
                "poster_path": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                "vote_average": 8.3,
                "vote_count": 30000,
                "popularity": 30.0,
                "director": "Christopher Nolan",
                "actors": "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
                "imdb_id": "tt1375666"
            },
            {
                "title": "The Shawshank Redemption",
                "overview": "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.",
                "release_date": "1994-09-23",
                "genres": "Drama|Crime",
                "poster_path": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
                "vote_average": 8.7,
                "vote_count": 21000,
                "popularity": 21.0,
                "director": "Frank Darabont",
                "actors": "Tim Robbins, Morgan Freeman, Bob Gunton",
                "imdb_id": "tt0111161"
            },
            {
                "title": "The Godfather",
                "overview": "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
                "release_date": "1972-03-14",
                "genres": "Drama|Crime",
                "poster_path": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
                "vote_average": 8.7,
                "vote_count": 15000,
                "popularity": 15.0,
                "director": "Francis Ford Coppola",
                "actors": "Marlon Brando, Al Pacino, James Caan",
                "imdb_id": "tt0068646"
            },
            {
                "title": "The Dark Knight",
                "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
                "release_date": "2008-07-16",
                "genres": "Drama|Action|Crime|Thriller",
                "poster_path": "https://image.tmdb.org/t/p/w500/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg",
                "vote_average": 8.5,
                "vote_count": 27000,
                "popularity": 27.0,
                "director": "Christopher Nolan",
                "actors": "Christian Bale, Heath Ledger, Aaron Eckhart",
                "imdb_id": "tt0468569"
            },
            {
                "title": "Pulp Fiction",
                "overview": "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
                "release_date": "1994-09-10",
                "genres": "Thriller|Crime",
                "poster_path": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                "vote_average": 8.5,
                "vote_count": 22000,
                "popularity": 22.0,
                "director": "Quentin Tarantino",
                "actors": "John Travolta, Uma Thurman, Samuel L. Jackson",
                "imdb_id": "tt0110912"
            }
        ]
        
        # Check for existing API movies first and skip sample movies 
        # that already exist as API movies
        for movie_data in list(sample_movies):
            existing_api_movie = Movie.query.filter_by(
                imdb_id=movie_data['imdb_id'], 
                data_source="omdb"
            ).first()
            
            if existing_api_movie:
                logger.info(f"API movie {movie_data['imdb_id']} already exists, skipping sample version")
                sample_movies.remove(movie_data)
        
        # Count how many movies we add
        added_count = 0
        
        # Insert sample movies into database
        for movie_data in sample_movies:
            # Check if sample movie exists
            existing_movie = Movie.query.filter_by(
                imdb_id=movie_data['imdb_id'],
                data_source="sample"
            ).first()
            
            if existing_movie:
                logger.info(f"Sample movie {movie_data['imdb_id']} already exists, skipping")
                continue
                
            release_date = None
            if movie_data.get('release_date'):
                try:
                    release_date = datetime.strptime(movie_data['release_date'], '%Y-%m-%d').date()
                except ValueError:
                    pass
            
            # Create new movie
            new_movie = Movie(
                tmdb_id=movie_data['imdb_id'].replace('tt', ''),
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
                actors=movie_data['actors'],
                data_source="sample"  # Mark this as coming from sample data
            )
            db.session.add(new_movie)
            added_count += 1
        
        # Commit all changes
        db.session.commit()
        logger.info(f"Successfully loaded {added_count} sample movies")
        
        return {
            "status": "success",
            "message": f"Successfully added {added_count} sample movies",
            "count": added_count
        }
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error loading sample data: {str(e)}")
        return {
            "status": "error",
            "message": f"Error loading sample data: {str(e)}"
        }