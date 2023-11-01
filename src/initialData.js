


const initialData = {
    columns: {
      'column1': {
        id: 'column1',
        title: 'Movies',
        itemIds: ['movie1', 'movie2', 'movie3', 'movie4'],
        items: {
          'movie1': { id: 'movie1', content: 'Intersteller' },
          'movie2': { id: 'movie2', content: 'Inception' },
          'movie3': { id: 'movie3', content: 'Tenent' },
          'movie4': { id: 'movie4', content: 'Memento' },
        },
      },

      'column2': {
        id: 'column2',
        title: 'TV Shows',
        itemIds: ['show1', 'show2', 'show3'],
        items: {
          'show1': { id: 'show1', content: 'How I Met Your Mother' },
          'show2': { id: 'show2', content: 'Attack on Titan' },
          'show3': { id: 'show3', content: 'Steins Gate' },
        },
      },

      'column3': {
        id: 'column3',
        title: 'Games',
        itemIds: ['game1', 'game2', 'game3', 'game4'],
        items: {
          'game1': { id: 'game1', content: 'Cyberpunk' },
          'game2': { id: 'game2', content: 'Death Stranding' },
          'game3': { id: 'game3', content: 'Spiderman 2' },
          'game4': { id: 'game4', content: 'God of War' },
        },
      },
    },
  
  // Facilitate reordering of the columns
  columnOrder: ['column1', 'column2', 'column3'],
};
  
  export default initialData;
  