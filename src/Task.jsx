import React from 'react';
import styled from 'styled-components'
import { Draggable } from 'react-beautiful-dnd';


const Container = styled.div`
  border: 2px solid lightgrey;
  border-radius: 25px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: white;
  font-family: 'Courier New', monospace;
  font-weight: ${props => (props['data-is-hovering'] || props['data-is-dragging'] ? 'bold' : 'inherit')};
  box-shadow: ${props => (props['data-is-hovering'] || props['data-is-dragging']? '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 4px 8px 0 rgba(0, 0, 0, 0.19)' : 'inherit')};
  display: flex;
`;

export default class Task extends React.Component {

  state = {
    isHovering: false
  }

  render() {
    return (
      <Draggable draggableId={this.props.item.id} index={this.props.index} type={this.props.title}>
        {(provided, snaphshot) => (
          <Container 
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            data-is-dragging={snaphshot.isDragging}
            data-is-hovering={this.state.isHovering}
            onMouseOverCapture={() => {this.setState({isHovering: true})}}
            onMouseOutCapture={() => {this.setState({isHovering: false})}}
          >
            {this.props.index+1 + '. ' + this.props.item.content}
          </Container>
        )}
      </Draggable>
    );
  }
}