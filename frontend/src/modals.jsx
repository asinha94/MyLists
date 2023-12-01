import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export function NewItemDialog({category, dialogOpen, setDialogOpen, onNewItemSubmit}) {
  const [newItem, setNewItem] = React.useState("");
  
  const handleClose = () => {setDialogOpen(false);};
  const onSubmit = () => {
    onNewItemSubmit(newItem);
    handleClose();
  }
  return (
    <React.Fragment>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Add new {category} item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the title of the 'categoty_unit' to 'consume'
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) => {
                setNewItem(e.target.value)
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onSubmit}>Add</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}


export function EditItemDialog({index, title, dialogOpen, setDialogOpen, handleCloseState, handleItemUpdate}) {
  const [editedTitle, setEditedTitle] = React.useState(title);
  
  const handleClose = () => {
    setDialogOpen(false);
    handleCloseState();
  };

  const onSubmit = () => {
    // Check for null value and changed value
    if (editedTitle !== "" && editedTitle !==  title) {
      handleItemUpdate(index, editedTitle);
    }
    handleClose();
  }

  return (
    <React.Fragment>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Set new title</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            type="text"
            fullWidth
            defaultValue={editedTitle}
            variant="standard"
            onChange={(e) => {
              setEditedTitle(e.target.value)
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onSubmit}>Set</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}


export function DeleteItemDialog({index, title, dialogOpen, setDialogOpen, handleCloseState, handleItemUpdate}) {
  const handleClose = () => {
    setDialogOpen(false);
    handleCloseState();
  };

  const onSubmit = () => {
    handleItemUpdate(index);
    handleClose();
  }
  return (
    <React.Fragment>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Delete '{title}'?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This cannot be undone
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color='error' onClick={onSubmit}>DELETE</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export function LoginDialog({dialogOpen, setDialogOpen, handleDrawerClose}) {
  const handleClose = () => {
    setDialogOpen(false);
    handleDrawerClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('username'),
      password: data.get('password'),
    });
    handleClose();
  };

  return (
    <React.Fragment>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="username"
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
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}