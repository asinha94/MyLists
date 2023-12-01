// React
import React, { useState } from 'react';
// Material UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Other
import {isMobile} from 'react-device-detect';
// The App
import Columns from './Column'
import { getInitialData } from './services';
import SearchAppBar from './AppBar';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});



export default function App() {
  const [loadedData, setLoadedData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const isDragDisabled = searchValue.length !== 0;
  const categories = Object.keys(loadedData).sort().map(column => column);
  
  // Update the initially selected category
  if (isMobile && selectedCategory === "" && categories.length > 0) {
    setSelectedCategory(categories[0]);
  }
  
  // GET the full list from the API
  getInitialData(loadedData, setLoadedData);
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SearchAppBar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setSearchValue={setSearchValue}
        />
      <Columns
        loadedData={loadedData}
        categories={categories}
        searchValue={searchValue}
        isDragDisabled={isDragDisabled}
        selectedCategory={selectedCategory}
      />
    </ThemeProvider> 
  )
}