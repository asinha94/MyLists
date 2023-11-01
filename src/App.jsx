import React from 'react';
import { useState } from 'react';
import styled from 'styled-components'
import { DragDropContext } from 'react-beautiful-dnd';

import Column from './Column'
import initialData from './initialData';


const Container = styled.div`
  display: flex;
`

function Category({categoryData}) {

  const [data, setData] = useState(categoryData)

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
  
    const newItemIds = Array.from(data.itemIds)
    // Remove from old position, insert into new
    newItemIds.splice(source.index, 1);
    newItemIds.splice(destination.index, 0, draggableId)
    
    const newData = {
      ...data,
      itemIds: newItemIds
    }

    setData(newData);
  }

  const items = data.itemIds.map(itemID => data.items[itemID]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Column key={data.id} column={data} items={items} />;
    </DragDropContext>
  );
}


export default function App() {
  return (
    <Container>
      {initialData.columnOrder.map(columnID => {
          const column = initialData.columns[columnID];
          return <Category key={columnID} categoryData={column} />;
        })}
    </Container>
  )
}