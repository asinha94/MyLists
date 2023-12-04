// React
import React, { useState, useEffect } from 'react';
// Material UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Other
import {isMobile} from 'react-device-detect';
// The App
import Columns from './Column'
import { getInitialData, getAllUsers } from './services';
import SearchAppBar from './AppBar';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});



export default function App() {
  const [users, setUsers] = useState([]);
  const [loadedData, setLoadedData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const isDragDisabled = searchValue.length !== 0;
  const categories = Object.keys(loadedData).sort().map(column => column);
  
  // Update the initially selected category
  if (isMobile && selectedCategory === "" && categories.length > 0) {
    setSelectedCategory(categories[0]);
  }

  // Get List of users for drawer
  useEffect(() => {
    getAllUsers().then( (userInfo) => {
      if (userInfo) {
        setUsers(userInfo.sort())
      }
    })
  }, []);
  
  // GET the full list from the API
  getInitialData(loadedData, setLoadedData);


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SearchAppBar
        users={users}
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