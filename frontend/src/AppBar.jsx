// React
import React, { useState } from 'react';
//Material UI
import { styled, alpha } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
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
import { LoginDialog } from './modals'


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
  
  
  export default function SearchAppBar({categories, selectedCategory, setSelectedCategory, setSearchValue}) {
    const [open, setOpen] = useState(false);
  
    const handleDrawerOpen = () => {
      setOpen(true);
    }
  
    const handleDrawerClose = () => {
      setOpen(false);
    }
  
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
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
            >
              My Lists
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
          <SideDrawerItem text="Login" handleDrawerClose={handleDrawerClose}/>
          <Divider/>
          <SideDrawerItem text="Chris' List" handleDrawerClose={handleDrawerClose}/>
          <SideDrawerItem text="Ewan's List" handleDrawerClose={handleDrawerClose}/>
          <SideDrawerItem text="Naoya's List" handleDrawerClose={handleDrawerClose}/>

        </Drawer>
      </Box>
    );
  }
  
  function SideDrawerItem({text, handleDrawerClose}) {
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
        />
      </div>        
      
    );
  }
  