import React, { useState} from 'react';
import { Draggable } from 'react-beautiful-dnd';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { EditItemDialog, DeleteItemDialog } from './modals'


function IconModal({label, title, IconType, DialogModal}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div>
      <IconButton aria-label={label} onClick={() => { setDialogOpen(true) }}>
        <IconType fontSize='small'/>
      </IconButton>
      <DialogModal
        title={title}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
      />
    </div>
  );
}

function ItemIcons({title}) {
  const style = {
    "marginLeft": "auto",
    "alignItems": "flex-start",
    "minWidth": 0
  }

  return (
    <div style={style}>
      <IconModal
        label="edit"
        title={title}
        IconType={EditIcon}
        DialogModal={EditItemDialog}
      />
      <IconModal
        label="delete"
        title={title}
        IconType={DeleteIcon}
        DialogModal={DeleteItemDialog}
      />        
    </div>
  );
}


function ItemContainer({index, item, provided, snaphshot, isDragDisabled}) {
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
      {index+1 + '.' + item.content}
      {isHovering && <ItemIcons title={item.content} />}
    </div>
  );
}

export default function ItemDraggable({item, index, title, isDragDisabled}) {
    return (
      <Draggable draggableId={item.id} index={index} type={title} isDragDisabled={isDragDisabled}>
        {(provided, snaphshot) => (
          <ItemContainer
            index={index}
            item={item}
            provided={provided}
            snaphshot={snaphshot}
            isDragDisabled={isDragDisabled}
          />
        )}
      </Draggable>
    );
}
