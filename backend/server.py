from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

initialData = {
    'column1': {
        'id': 'column1',
        'title': 'Movies',
        'items': [
            { 'id': 'movie1', 'content': 'Intersteller' },
            { 'id': 'movie2', 'content': 'Inception' },
            { 'id': 'movie3', 'content': 'Tenent' },
            { 'id': 'movie4', 'content': 'Memento' },
        ],
    },

    'column2': {
        'id': 'column2',
        'title': 'TV Shows',
        'items': [
            { 'id': 'show1', 'content': 'How I Met Your Mother' },
            { 'id': 'show2', 'content': 'Attack on Titan' },
            { 'id': 'show3', 'content': 'Steins Gate' },
        ],
    },

    'column3': {
        'id': 'column3',
        'title': 'Games',
        'items': [
            { 'id': 'game1', 'content': 'Cyberpunk' },
            { 'id': 'game2', 'content': 'Death Stranding' },
            { 'id': 'game3', 'content': 'Spiderman 2' },
            { 'id': 'game4', 'content': 'God of War' },
        ],
    },
}


@app.get('/data')
def get_all_data():
    return initialData