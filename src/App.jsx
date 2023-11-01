import React from 'react';
import { useState } from 'react';
import styled from 'styled-components'
import { DragDropContext } from 'react-beautiful-dnd';

import Column from './Column'
import initialData from './initialData';


const Container = styled.div`
  display: flex;
`


export default function App() {

  const [data, setData] = useState(initialData)

  const onDragEnd = result => {
    //console.log(result);
    const {destination, source, draggableId} = result;
  
    // Dropped from list
    if (!destination) {
      return;
    }
    
    // Moved to same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
    }
  
    const columns = data.columns[source.droppableId]
    const newTaskIds = Array.from(columns.taskIds)
    // Remove from old position, insert into new
    newTaskIds.splice(source.index, 1);
    newTaskIds.splice(destination.index, 0, draggableId)
    
    const newColumn = {
      ...columns,
      taskIds: newTaskIds
    }

    const newData = {
      ...data,
      columns: {
        ...data.columns,
        [newColumn.id]: newColumn
      }
    }
    console.log(newData);
    setData(newData);

  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
        {data.columnOrder.map(columnID => {
          const column = data.columns[columnID];
          const tasks = column.taskIds.map(taskId => data.tasks[taskId]);
          return <Column key={column.id} column={column} tasks={tasks} />;
        })}
      </Container>
    </DragDropContext>
  );
}