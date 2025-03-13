import requests
response = requests.post('http://localhost:5000/api/movies/load-from-omdb', json={})
print(response.json())