import React, { useState} from 'react';
import { Draggable } from 'react-beautiful-dnd';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { EditItemDialog, DeleteItemDialog } from './modals'


function IconModal({label, index, title, IconType, DialogModal, handleCloseState, handleItemUpdate}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div style={{flex: 1}}>
      <IconButton aria-label={label} onClick={() => { setDialogOpen(true) }}>
        <IconType fontSize='small'/>
      </IconButton>
      <DialogModal
        index={index}
        title={title}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        handleCloseState={handleCloseState}
        handleItemUpdate={handleItemUpdate}
      />
    </div>
  );
}

function ItemIcons({index, title, handleCloseState, OnItemEditSet, OnItemDeleteConfirm}) {
  return (
    <div style={{display: 'flex', marginLeft: "auto"}}>
      <IconModal
        label="edit"
        index={index}
        title={title}
        IconType={EditIcon}
        DialogModal={EditItemDialog}
        handleCloseState={handleCloseState}
        handleItemUpdate={OnItemEditSet}
      />
      <IconModal
        label="delete"
        index={index}
        title={title}
        IconType={DeleteIcon}
        DialogModal={DeleteItemDialog}
        handleCloseState={handleCloseState}
        handleItemUpdate={OnItemDeleteConfirm}
      />        
    </div>
  );
}


function ItemContainer({index, item, provided, snaphshot, isDragDisabled, OnItemEditSet, OnItemDeleteConfirm, authorized}) {
  const [isHovering, setIsHovering] = useState(false);
  const draggableProps = provided.draggableProps;
  const dragHandleProps = provided.dragHandleProps;
  const isDragging = snaphshot.isDragging;
  const shouldHighlight = !isDragDisabled && (isHovering || isDragging);
  const style = {
    "border": "2px solid " + (shouldHighlight ? "white": "#545454"),
    "borderRadius": "25px",
    "padding": "8px",
    "marginBottom": "8px",
    "fontFamily": "'Courier New', monospace",
    "fontWeight": shouldHighlight ? "bold" : "inherit",
    "boxShadow":  shouldHighlight ? "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 4px 8px 0 rgba(0, 0, 0, 0.19)" : "inherit", 
    "display": "flex",
    "flexWrap": "wrap",
  };

  // Have to make sure not to clobber the dnd styles
  const styles = {
    ...draggableProps.style,
    ...(isDragDisabled ? [] : dragHandleProps.style),
    ...style
  }

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={styles}
      onMouseOverCapture={() => {setIsHovering(true)}}
      onMouseOutCapture={() =>  {setIsHovering(false)}}
    >
      <div>
        {index+1 + '.' + item.content}
      </div>
      {isHovering && authorized &&
        <ItemIcons
          index={index}
          title={item.content}
          handleCloseState={() => {setIsHovering(false)}}
          OnItemEditSet={OnItemEditSet}
          OnItemDeleteConfirm={OnItemDeleteConfirm}
        />
      }
    </div>
  );
}

export default function ItemDraggable({item, index, title, isDragDisabled, OnItemEditSet, OnItemDeleteConfirm, authorized}) {
    return (
      <Draggable draggableId={item.id} index={index} type={title} isDragDisabled={isDragDisabled}>
        {(provided, snaphshot) => (
          <ItemContainer
            index={index}
            item={item}
            provided={provided}
            snaphshot={snaphshot}
            isDragDisabled={isDragDisabled}
            OnItemEditSet={OnItemEditSet}
            OnItemDeleteConfirm={OnItemDeleteConfirm}
            authorized={authorized}
          />
        )}
      </Draggable>
    );
}
