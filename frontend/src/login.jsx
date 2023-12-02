import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';


function SignIn({index}) {
    return (
      <div hidden={tabIndex !== 0}>
          <Box component="form" onSubmit={handleSubmitLogin} noValidate sx={{ mt: 1 }}>
              <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              />
              <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              />
              <Button type="submit" fullWidth variant="contained">Login</Button>
          </Box>
          </div>
    )
}

function SignUp({index}) {

}


export function LoginDialog({dialogOpen, setDialogOpen, handleDrawerClose}) {
    const [tabIndex, setTabIndex] = React.useState(0);
  
    const handleTabIndexChange = (_, newIndex) => {
      setTabIndex(newIndex)
    }
    
    const handleClose = () => {
      setDialogOpen(false);
      handleDrawerClose();
    };
  
    const handleSubmitLogin = (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      console.log({
        email: data.get('username'),
        password: data.get('password'),
      });
      handleClose();
    };
  
    const handleSubmitRegister = (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      console.log({
        email: data.get('username'),
        password: data.get('password'),
        confirm: data.get('confirm-password'),
      });
      handleClose();
    };
  
  
    return (
      <React.Fragment>
        <Dialog open={dialogOpen} onClose={handleClose}>
          <DialogContent>
          <Tabs
            value={tabIndex}
            onChange={handleTabIndexChange}
          >
            <Tab label="Login" />
            <Tab label="Register"/>
          </Tabs>
  
          
  
          <div hidden={tabIndex !== 1}>
            <Box component="form" onSubmit={handleSubmitRegister} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
              />
  
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirm-password"
                label="Confirm Password"
                type="password"
                id="confirm-password"
              />
              <Button type="submit" fullWidth variant="contained">Register</Button>
            </Box>
          </div>
  
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }