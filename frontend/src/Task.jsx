import React, { useState} from 'react';
import { Draggable } from 'react-beautiful-dnd';


function ItemContainer({index, item, provided, snaphshot}) {
  const [isHovering, setIsHovering] = useState(false);

  const draggableProps = provided.draggableProps;
  const dragHandleProps = provided.dragHandleProps;
  const isDragging = snaphshot.isDragging;
  const style = {
    "border": "2px solid lightgrey",
    "borderRadius": "25px",
    "padding": "8px",
    "marginBottom": "8px",
    "backgroundColor": "white",
    "fontFamily": "'Courier New', monospace",
    "fontWeight": (isHovering || isDragging) ? "bold" : "inherit",
    "boxShadow":  (isHovering || isDragging) ? "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 4px 8px 0 rgba(0, 0, 0, 0.19)" : "inherit", 
    "display": "flex",
  };

  const styles = {
    ...draggableProps.style,
    ...dragHandleProps.style,
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


export default class Task extends React.Component {

  state = {
    isHovering: false
  }

  render() {
    return (
      <Draggable draggableId={this.props.item.id} index={this.props.index} type={this.props.title}>
        {(provided, snaphshot) => (
          <ItemContainer index={this.props.index} item={this.props.item} provided={provided} snaphshot={snaphshot}/>
        )}
      </Draggable>
    );
  }
}