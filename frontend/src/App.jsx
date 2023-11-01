import React from 'react';
import { useState } from 'react';
import styled from 'styled-components'
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column'
import { getInitialData } from './services/data';


const Container = styled.div`
  display: flex;
`

function Category({categoryData}) {

  const [data, setData] = useState(categoryData)

  const onDragEnd = result => {
    //console.log(result);
    const {destination, source} = result;
    // Dropped from list
    if (!destination) {
      return;
    }
    
    // Moved to same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
    }
  
    // Remove from old position, insert into new
    const newItems = Array.from(data.items)
    const [item] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, item)
    const newData = {
      ...data,
      items: newItems
    }

    setData(newData);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Column key={data.id} column={data} items={data.items} />;
    </DragDropContext>
  );
}


export default function App() {

  const [loadedData, setLoadedData] = useState({});

  getInitialData(loadedData, setLoadedData);

  return (
    <Container>
      {Object.keys(loadedData).map(columnID => {
          const column = loadedData[columnID];
          return <Category key={columnID} categoryData={column} />;
        })}
    </Container>
  )
}