import React, { useState} from 'react';
import { Draggable } from 'react-beautiful-dnd';


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
