import React from 'react';
import { useState } from 'react';
import styled from 'styled-components'
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column'
import { getInitialData, sendReorderedItem } from './services/data';


const Container = styled.div`
  display: flex;
`

function Category({categoryData}) {

  const [data, setData] = useState(categoryData);

  const createChangeDelta = (newIndex, newItems) => {
    
    let item = newItems[newIndex];
    let itemBefore = null;
    let itemAfter = null;

    // exclude case where item moved to the top
    if (newIndex !== 0) {
      itemBefore = newItems[newIndex-1]
    }

    const endIndex = newItems.length - 1; 
    if (newIndex !== endIndex) {
      itemAfter = newItems[newIndex+1]
    }

    return {
      "category": data.title,
      "itemBefore": itemBefore,
      "item": item,
      "itemAfter": itemAfter,
    }
  };

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

    // Send update to backend
    const changeDelta = createChangeDelta(destination.index, newItems);
    sendReorderedItem(changeDelta)
    
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Column key={data.id} column={data} items={data.items} />
    </DragDropContext>
  );
}


export default function App() {

  const [loadedData, setLoadedData] = useState({});

  getInitialData(loadedData, setLoadedData);

  return (
    <Container>
      {Object.keys(loadedData).sort().map(columnID => {
          const column = loadedData[columnID];
          return <Category key={columnID} categoryData={column} />
        })}
    </Container>
  )
}