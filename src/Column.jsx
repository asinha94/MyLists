import React from 'react';
import styled from 'styled-components'
import { Droppable } from 'react-beautiful-dnd';
import Task from './Task'

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 300px;
`;

const Title = styled.h3`
  padding: 8px;
  font-family: 'Courier New', monospace;
`;

const TaskList = styled.div`
  padding: 8px;
  flex-grow: 1;
  min-height: 100px;
`;


export default class Column extends React.Component {
  render() {
    const title = this.props.column.title;
    return (
      <Container>
        <Title>{title}</Title>
        <Droppable droppableId={this.props.column.id} type={title}>
          {(provided, snaphshot) => (
            <TaskList
              ref={provided.innerRef}
              {...provided.droppableProps}
              data-is-dragging-over={snaphshot.isDraggingOver}
            >
              {this.props.items.map((item, index) => <Task key={item.id} item={item} index={index} title={title}/>)}
              {provided.placeholder}
            </TaskList>
          )}
        </Droppable>
      </Container>
    );
  }
}