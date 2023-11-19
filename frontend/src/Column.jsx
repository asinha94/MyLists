import React, { useState } from 'react';
import { Droppable, DragDropContext } from 'react-beautiful-dnd';
import Item from './Item'
import { getInitialData, sendReorderedItem } from './services';

const columnStyle = {
  "margin": "8px",
  "border": "1px solid #545454",
  "borderRadius": "2px",
  "width": "300px"
}

const titleSyle = {
  "padding": "8px",
  "fontFamily": "'Courier New', monospace"
}

const itemListStyle = {
  "padding": "8px",
  "flexGrow": 1,
  "minHeight": "100px"
}


function Column({column, items}) {
  const title = column.title;
  
  return (
    <div style={columnStyle}>
      <h3 style={titleSyle}>{title}</h3>
      <Droppable droppableId={column.id} type={title}>
        {(provided, snaphshot) => {

          const style = {
            ...provided.droppableProps.style,
            ...itemListStyle
          };

          return (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={style}
          >
            {items.map((item, index) => <Item key={item.id} item={item} index={index} title={title}/>)}
            {provided.placeholder}
          </div>)
        }}
      </Droppable>
    </div>
  );
}

function Category({categoryData}) {
  const [data, setData] = useState(categoryData);

  const createChangeDelta = (newIndex, newItems) => {
    const emptyItem = {
      id: "",
      content: "",
      order_key: ""
    };

    let item = newItems[newIndex];
    let itemBefore = emptyItem;
    let itemAfter = emptyItem;

    // exclude case where item moved to the top
    if (newIndex !== 0) {
      itemBefore = newItems[newIndex-1]
    }

    const endIndex = newItems.length - 1; 
    if (newIndex !== endIndex) {
      itemAfter = newItems[newIndex+1]
    }

    return {
      category: data.title,
      itemBefore: itemBefore,
      item: item,
      itemAfter: itemAfter,
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

    // Send update to backend and hopefully get a response
    const changeDelta = createChangeDelta(destination.index, newItems);
    sendReorderedItem(changeDelta).then(newItem => {

      // Re-render the old list if there is an error
      if (newItem === null) {
        setData(data);
        return;
      }

      // If no error, update the item with the new key
      // Unfortunately needs a re-render
      newItems[destination.index] = newItem;
      setData(newData);
    })
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Column key={data.id} column={data} items={data.items} />
    </DragDropContext>
  );
}


export default function Columns({loadedData}) {
  return (
    <div style={{display: "flex"}}>
        {Object.keys(loadedData).sort().map(columnID => {
            const column = loadedData[columnID];
            return <Category key={columnID} categoryData={column} />
          })}
      </div>
  );
}