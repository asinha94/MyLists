// React
import React, { useState } from 'react';
//Material UI
import { styled, alpha } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import InputLabel from '@mui/material/InputLabel';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Select from '@mui/material/Select';
// Other
import {isMobile} from 'react-device-detect';
// The App
import { LoginDialog } from './login'
import { NewCategoryDialog } from './modals'


const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  }));
  
  
const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
  
  
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));
  
  
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


function CategoryDropdown({categories, selectedCategory, setSelectedCategory}) {  
  const handleChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  if (isMobile) {
    return (
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id="demo-simple-select-standard-label">Category</InputLabel>
      <Select
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        value={selectedCategory}
        onChange={handleChange}
        label="Category"
      >

        {categories.map(category => {
          return <MenuItem key={category} value={category}>{category}</MenuItem>
        })}
      </Select>
    </FormControl>
    );
  }
}


function LoginSideDrawerItem({text, handleDrawerClose, handleNewUserRegister, handleUserLogin}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <ListItem key={text} disablePadding>
        <ListItemButton onClick={() => setOpen(true)}>
          <ListItemIcon>
            <AccountCircleIcon/>
          </ListItemIcon>
          <ListItemText primary={text} />
        </ListItemButton>
      </ListItem>
      <LoginDialog
        dialogOpen={open}
        setDialogOpen={setOpen}
        handleDrawerClose={handleDrawerClose}
        handleNewUserRegister={handleNewUserRegister}
        handleUserLogin={handleUserLogin}
      />
    </div>        
    
  );
}


function UserSideDrawerItem({user, setSelectedUser, handleDrawerClose}) {
  const userGuid = user.user_guid;
  const userDisplayName = user.display_name;

  const handleOnClick = () => {
    setSelectedUser(user);
    handleDrawerClose();
  };
  return (
    <ListItem key={userGuid} disablePadding>
      <ListItemButton onClick={handleOnClick}>
        <ListItemIcon>
          <AccountCircleIcon/>
        </ListItemIcon>
        <ListItemText primary={userDisplayName} />
      </ListItemButton>
    </ListItem>
  );
}


function UserSignedInDrawerItems({user, setSelectedUser, handleDrawerClose, handleUserSignOut}) {
  const userGuid = user.user_guid;

  return (
    <div>
      <UserSideDrawerItem
        key={user.user_guid}
        user={user}
        setSelectedUser={setSelectedUser}
        handleDrawerClose={handleDrawerClose}
      />
      <ListItem key={userGuid + "SignOut"} disablePadding>
        <ListItemButton onClick={handleUserSignOut}>
          <ListItemIcon>
            <AccountCircleIcon/>
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItemButton>
      </ListItem>
    </div>
  );
}

export default function SearchAppBar({users, categories, selectedCategory, setSelectedCategory, setSearchValue, selectedUser, setSelectedUser, handleNewUserRegister, handleUserLogin, loggedInUser, handleAddNewCategory, authorized, handleUserSignOut}) {
  const [open, setOpen] = useState(false);
  const [newCategoryOpen, SetNewCategoryOpen] = useState(false);

  const displayName = selectedUser.display_name;
  const appostrophe_s = displayName[displayName.length - 1] === 's' ? '' : 's';
  const listTitle = `${displayName}'${appostrophe_s} List`
  const displayedUsers = users.filter(user => {
    return loggedInUser === null || user.user_guid !== loggedInUser.user_guid
  });

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const plusOnClick = () => {
    SetNewCategoryOpen(true);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" open={open}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={handleDrawerOpen}
          >
            <MenuIcon />
          </IconButton>

          {authorized &&
            <div>
              <IconButton aria-label="Example" onClick={plusOnClick}>
                <AddIcon />
              </IconButton>
              <NewCategoryDialog
                categories={categories}
                dialogOpen={newCategoryOpen}
                setDialogOpen={SetNewCategoryOpen}
                userGuid={selectedUser.user_guid}
                onNewCategorySubmit={handleAddNewCategory}
              />
            </div>}

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            {listTitle}
          </Typography>

          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              type="search"
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
            />
          </Search>

          <CategoryDropdown
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        anochor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider/>
        {loggedInUser ? (
          <UserSignedInDrawerItems
            key={loggedInUser.user_guid}
            user={loggedInUser}
            setSelectedUser={setSelectedUser}
            handleDrawerClose={handleDrawerClose}
            handleUserSignOut={handleUserSignOut}
          />
        ) : (
          <LoginSideDrawerItem
            text="Login / Register"
            handleDrawerClose={handleDrawerClose}
            handleNewUserRegister={handleNewUserRegister}
            handleUserLogin={handleUserLogin}
          />
        )}

        <Divider/>

        {displayedUsers.map(user => 
          <UserSideDrawerItem
            key={user.user_guid}
            user={user}
            setSelectedUser={setSelectedUser}
            handleDrawerClose={handleDrawerClose}
          />
        )}
      </Drawer>
    </Box>
  );
}
  

  