import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { addNewCategory } from './services'


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


export function NewCategoryDialog({categories, dialogOpen, setDialogOpen, userGuid, onNewCategorySubmit}) {
  
  const [helperText, setHelperText] = React.useState('');

  const helperTextError = " category already exists!";
  const categoriesKeys = categories.reduce((a,v) => ({...a, [v.toLowerCase()]: v}), {});

  const handleClose = () => {
    setDialogOpen(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const category = data.get('category');
    const unit = data.get('unit');
    const verb = data.get('verb');

    if (category.toLowerCase() in categories) {
      return;
    }

    addNewCategory(userGuid, category, unit, verb).then((response) => {
      if (response !== null) {
        onNewCategorySubmit(category, unit, verb);
        handleClose();
      }
    })

    
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
              id="category"
              name="category"
              label="Category"
              type="text"
              onChange={(e) => {
                const newCategory = e.target.value;
                const newCategoryLowercase = newCategory.toLowerCase();
                const newHelperText = newCategoryLowercase in categoriesKeys ? categoriesKeys[newCategoryLowercase] + helperTextError: "";
                setHelperText(newHelperText);
              }}
              helperText={helperText}
              error={helperText!==""}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="unit"
              name="unit"
              label="Unit e.g movie/show/book/game etc..."
              type="text"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="verb"
              name="verb"
              label="Verb e.g watch/play/binge etc...."
              type="text"
            />
            <Button type="submit" fullWidth variant="contained">Add Category</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}