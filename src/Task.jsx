import React from 'react';
import styled from 'styled-components'
import { Draggable } from 'react-beautiful-dnd';


const Container = styled.div`
  border: 2px solid lightgrey;
  border-radius: 25px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${props => (props.isDragging ? 'lightgreen' : 'white')};
  font-family: 'Courier New', monospace;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 4px 8px 0 rgba(0, 0, 0, 0.19);
  display: flex;
`;


export default class Task extends React.Component {
  render() {
    return (
      <Draggable draggableId={this.props.task.id} index={this.props.index}>
        {(provided, snaphshot) => (
          <Container 
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            isDragging={snaphshot.isDragging}
          >          
            {this.props.task.content}
          </Container>
        )}
      </Draggable>
    );
  }
}