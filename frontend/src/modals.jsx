import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function NewItemDialog({category, dialogOpen, setDialogOpen, onNewItemSubmit}) {
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