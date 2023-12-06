import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


export function NewItemDialog({category, unit, verb, dialogOpen, setDialogOpen, onNewItemSubmit}) {
  const [newItem, setNewItem] = React.useState("");
  const [helperText, setHelperText] = React.useState("");
  const emptyTitleMsg = "Title cannot be empty";
  
  const handleClose = () => {setDialogOpen(false);};
  const onSubmit = () => {
    if (newItem === "") {
      setHelperText(emptyTitleMsg);
      return;
    }

    onNewItemSubmit(newItem);
    handleClose();
  }
  return (
    <React.Fragment>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Add new {category} item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the title of the {unit} to {verb}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            helperText={helperText}
            error={helperText!==""}
            onChange={(e) => {               
              const newValue = e.target.value;
              setNewItem(newValue);
              const newHelperTextValue = newValue === "" ? emptyTitleMsg : "";
              setHelperText(newHelperTextValue);
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
  const [helperText, setHelperText] = React.useState('');
  const emptyTitleMsg = "Title cannot be empty";


  const handleClose = () => {
    setDialogOpen(false);
    handleCloseState();
  };

  const onSubmit = () => {
    // If value not changed, dont need to do anything
    if (editedTitle !==  title) {

    
      if (editedTitle !== "") {
        handleItemUpdate(index, editedTitle);
      } else {
        setHelperText(emptyTitleMsg);
        return;
      }
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
            helperText={helperText}
            error={helperText!==""}
            variant="standard"
            onChange={(e) => {
              const newValue = e.target.value;
              setEditedTitle(newValue);
              const newHelperTextValue = newValue === "" ? emptyTitleMsg : "";
              setHelperText(newHelperTextValue);
              
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


export function NewCategoryDialog({dialogOpen, setDialogOpen, onNewCategorySubmit}) {
  const [newCategory, setNewCategory] = React.useState("");
  const [newUnit, setNewunit] = React.useState("");
  const [newVerb, setNewVerb] = React.useState("");
  
  const handleClose = () => {
    setDialogOpen(false);
  };

  const onSubmit = () => {
    onNewCategorySubmit(newCategory);
    handleClose();
  }
  return (
    <React.Fragment>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Enter the title of the new category</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="normal"
              required
              fullWidth
              id="name"
              label="Category"
              type="text"
              onChange={(e) => {
                newCategory(e.target.value)
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Unit i.e movie/show/book/game etc..."
              type="text"
              onChange={(e) => {
                newCategory(e.target.value)
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Verb i.e watch/play/binge etc...."
              type="text"
              onChange={(e) => {
                newCategory(e.target.value)
              }}
            />
            <Button type="submit" fullWidth variant="contained">Add Category</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}