import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// App
import { registerUser, loginUser } from './services'

const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_NO_MATCH_MSG = "Passwords must match";
/* eslint-disable no-useless-escape */
const PASSWORD_VALIDATION_MSG = "Password must be a mix of uppercase, lowercase, numbers and special characters (!@#$%^&*()?/<>,./\|)"; 


function passwordSuccessfullInputValidation(password) {
  const hasNumber = /\d/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()?/<>,./\|]/.test(password);
  return hasNumber && hasLowerCase && hasUpperCase && hasSpecialChars;
}

function SignIn({tabIndex, index, handleClose}) {
  const [failedPassword, setFailedPassword] = React.useState('');
  const [failedUsername, setFailedUsername] = React.useState('');
  const [passwordHelperText, setPasswordErrorText] = React.useState('');

  const handleSubmitLogin = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget); 
    const username = data.get('username');
    const password = data.get('password');
    
    if (username === failedUsername && password === failedPassword) {
      return false;
    }

    if (!passwordSuccessfullInputValidation(password)) {
      setFailedUsername(username);
      setFailedPassword(password);
      setPasswordErrorText(PASSWORD_VALIDATION_MSG);
      return false;
    }

    loginUser(username, password).then(result => {
      if (result === null) {
        return false;
      }

      if (result.authorized) {
        // TODO: trigger login flow from here
        handleClose();
        return true;
      }

      setFailedUsername(username);
      setFailedPassword(password);
      setPasswordErrorText(result.authFailReason);

    });
    
    
    handleClose();
  };


  const handleUsernameChange = (event) => {
    const usernameValue = event.target.value;
    // Set helper message if password doesnt validate correctly
    if (failedUsername && usernameValue !== failedUsername) {
      setFailedPassword('');
      setFailedUsername('');
      setPasswordErrorText('');
    }
  }

  const handlePasswordChange = (event) => {
    const passwordValue = event.target.value;
    // Set helper message if password doesnt validate correctly
    if (failedPassword && passwordValue !== failedPassword) {
      setFailedPassword('');
      setFailedUsername('');
      setPasswordErrorText('');
    }
  };

  return (
    <div hidden={tabIndex !== index}>
      <Box component="form" onSubmit={handleSubmitLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            onChange={handleUsernameChange}
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
            onChange={handlePasswordChange}
            inputProps={{ minLength: MIN_PASSWORD_LENGTH }}
            helperText={passwordHelperText}
            error={passwordHelperText!==""}
          />
          <Button type="submit" fullWidth variant="contained">Login</Button>
      </Box>
    </div>
  );
}

function SignUp({tabIndex, index, handleClose}) {
  const [failedUsername, setFailedUsername] = React.useState('');
  const [usernameHelperText, setUsernameHelperText] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordHelperText, setPasswordErrorText] = React.useState('');
  const [confirmPasswordHelperText, setConfirmPasswordHelperText] = React.useState('');


  const handleRegisterSubmit= (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const displayname = data.get('displayname');
    const username = data.get('username');
    const pw1 = data.get('password');
    const pw2 = data.get('confirm-password');

    // Prevent resubmit if the dup username is being tried again
    if (username === failedUsername) {
      return false;
    }

    // Validate passwords
    if (!passwordSuccessfullInputValidation(pw1)) {
      setConfirmPasswordHelperText(PASSWORD_VALIDATION_MSG);
      return false;
    }

    // Check the match
    if (pw1 !== pw2) {
      setConfirmPasswordHelperText(PASSWORD_NO_MATCH_MSG);
      return false;
    }

    registerUser(displayname, username, pw1, PASSWORD_VALIDATION_MSG).then(registerResponse => {
      if (registerResponse === null) {
        return;
      }

      if (registerResponse.authorized) {
        // TODO: tell user to sign in again
        handleClose();
        return;
      }

      if (registerResponse.authFailReason === "loggedin") {
        // TODO: Trigger usual sign in flow
        // This most likely cant happen
      }

      if (registerResponse.authFailReason === 'username') {
        setFailedUsername(username);
        setUsernameHelperText(registerResponse.authReason);
      }

      else if (registerResponse.authFailReason === 'password') {
        setPasswordErrorText(registerResponse.authReason);
      }

      else {
        console.log("Unknown failure reason: " + registerResponse.authFailReason);
      }
    })
  };

  const handleUsernameChange = (event) => {
    setUsernameHelperText("");
  }

  const handlePasswordChange = (event) => {
    const passwordValue = event.target.value;
    setPassword(passwordValue)
    // Set helper message if password doesnt validate correctly
    const errorMsg = passwordSuccessfullInputValidation(passwordValue) ? '' : PASSWORD_VALIDATION_MSG;
    setPasswordErrorText(errorMsg);

    // Set helper message if both passwords dont match
    const confirmErrorMsg = passwordValue === confirmPassword ? '' : PASSWORD_NO_MATCH_MSG;
    setConfirmPasswordHelperText(confirmErrorMsg);
  };

  const handleComfirmPasswordChange = (event) => {
    const passwordValue = event.target.value;
    setConfirmPassword(passwordValue);

    const confirmErrorMsg = passwordValue === password ? '' : PASSWORD_NO_MATCH_MSG;
    setConfirmPasswordHelperText(confirmErrorMsg);
  };

  return (
    <div hidden={tabIndex !== index}>
      <Box component="form" onSubmit={handleRegisterSubmit} sx={{ mt: 1 }}>
      <TextField
          margin="normal"
          required
          fullWidth
          id="displayname"
          label="Display Name"
          name="displayname"
          autoComplete="name"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          onChange={handleUsernameChange}
          helperText={usernameHelperText}
          error={usernameHelperText!==""}
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
          inputProps={{ minLength: MIN_PASSWORD_LENGTH }}
          onChange={handlePasswordChange}
          helperText={passwordHelperText}
          error={passwordHelperText!==""}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirm-password"
          label="Confirm Password"
          type="password"
          id="confirm-password"
          helperText={confirmPasswordHelperText}
          error={confirmPasswordHelperText!==""}
          onChange={handleComfirmPasswordChange}
        />
        <Button type="submit" fullWidth variant="contained">Register</Button>
      </Box>
    </div>
  );
}


export function LoginDialog({dialogOpen, setDialogOpen, handleDrawerClose}) {
    const [tabIndex, setTabIndex] = React.useState(0);
  
    const handleTabIndexChange = (_, newIndex) => {
      setTabIndex(newIndex)
    }
    
    const handleClose = () => {
      setDialogOpen(false);
      handleDrawerClose();
      setTabIndex(0);
    };
  
    return (
      <React.Fragment>
        <Dialog open={dialogOpen} onClose={handleClose}>
          <DialogContent>
          <Tabs
            value={tabIndex}
            onChange={handleTabIndexChange}
            variant="fullWidth"
          >
            <Tab label="Login" />
            <Tab label="Register"/>
          </Tabs>
          <SignIn
            index={0}
            tabIndex={tabIndex}
            handleClose={handleClose}
          />
          <SignUp
            index={1}
            tabIndex={tabIndex}
            handleClose={handleClose}
          />
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }