// React
import React, { useState, useEffect } from 'react';
// Material UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Other
import {isMobile} from 'react-device-detect';
// The App
import Columns from './Column'
import { getUserItemData, getAllUsers } from './services';
import SearchAppBar from './AppBar';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});



export default function App() {
  // Users to display
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({})
  const [selectedUser, setSelectedUser] = useState({user_guid: '0', display_name: 'Empty'});

  // All the data used per user. Might want to switch to its own component
  // for persistence so we dont need a GET each time
  const [loadedData, setLoadedData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const isDragDisabled = searchValue.length !== 0;
  const categories = Object.keys(loadedData).sort().map(column => column);
  
  // Update the initially selected category
  if (isMobile && selectedCategory === "" && categories.length > 0) {
    setSelectedCategory(categories[0]);
  }

  /* Comparison function for users, used for sorting them lexically */
  const usersCmp = (userA, userB) => {
    const displayA = userA.display_name;
    const displayB = userB.display_name;

    if (displayA < displayB) {
      return -1;
    }

    if (displayA > displayB) {
      return 1;
    }

    return 0;
  }

  const handleNewUserRegister = (user) => {
    const newUsers = Array.from(users)
    newUsers.push(user)
    console.log(newUsers);
    
    setUsers(newUsers.sort(usersCmp));
  };

  // Get List of users for drawer. Set first user as selected user
  useEffect(() => {
    getAllUsers().then(userInfo => {
      if (!userInfo) {
        return;
      }

      // Store users list as a objects, sorted by display name
      const usersSortedByDisplayName = userInfo.sort(usersCmp);
      setUsers(usersSortedByDisplayName);
      setSelectedUser(usersSortedByDisplayName[0]);

    })
  }, []);
  
  // GET the full list from the API for a particular user
  useEffect(() => {
    if (selectedUser) {
      const userGuid = selectedUser.user_guid;
      getUserItemData(userGuid).then(userData => {
        if (userData) {
          setLoadedData(userData)
        }
      })
    }
  }, [selectedUser]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SearchAppBar
        users={users}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setSearchValue={setSearchValue}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleNewUserRegister={handleNewUserRegister}
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