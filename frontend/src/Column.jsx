import React, { useState } from 'react';
import { createSvgIcon } from '@mui/material/utils';
import IconButton from '@mui/material/IconButton';
import { Droppable, DragDropContext } from 'react-beautiful-dnd';
import { isMobile } from 'react-device-detect';
import Item from './Item'
import { sendReorderedItem } from './services';

const columnStyle = {
  "margin": "8px",
  "border": "1px solid #545454",
  "borderRadius": "2px",
  "width": isMobile ? "inherit" : "300px"
}

const itemListStyle = {
  "padding": "8px",
  "flexGrow": 1,
  "minHeight": "100px"
}

const PlusIcon = createSvgIcon(
  // credit: plus icon from https://heroicons.com/
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>,
    'Plus',
);


function TitleBar({title}) {
  const titleSyle = {
    "padding": "8px",
    "fontFamily": "'Courier New', monospace",
    "justifyContent": "center",
    "textAlign": "center"
  }

  const divStyle = {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
  }

  const plusOnClick = (event) => {
    console.log("Click event for " + title);
  }

  return (
    <div style={divStyle}>
      <h3 style={titleSyle}>{title}</h3>
      <IconButton aria-label="Example" onClick={plusOnClick}>
        <PlusIcon />
      </IconButton>
    </div>
  )
}


function Column({column, items, searchValue, isDragDisabled}) {
  const title = column.title;

  const displayItems = searchValue.length === 0 ? items : items.filter((item) =>
    item.content.toLowerCase().includes(searchValue.toLowerCase())
  );
  
  return (
    <div style={columnStyle}>
      <TitleBar title={title}/>
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
            {displayItems.map((item, index) =>
              <Item
                key={item.id}
                item={item}
                index={index}
                title={title}
                isDragDisabled={isDragDisabled}
              />)}
            {provided.placeholder}
          </div>)
        }}
      </Droppable>
    </div>
  );
}

function Category({categoryData, searchValue, isDragDisabled}) {
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
      <Column
        key={data.id}
        column={data}
        items={data.items}
        searchValue={searchValue}
        isDragDisabled={isDragDisabled}
      />
    </DragDropContext>
  );
}


export default function Columns({loadedData, categories, searchValue, isDragDisabled, selectedCategory}) {
  if (isMobile) {
    if (selectedCategory) {
      const column = loadedData[selectedCategory];
      return (
        <Category
          key={selectedCategory}
          categoryData={column}
          isDragDisabled={isDragDisabled}
          searchValue={searchValue}
        />
      )
    }

    return <div/>
  }
  
  return (
    <div style={{display: "flex"}}>
      {categories.map(columnID => {
          const column = loadedData[columnID];
          return <Category
            key={columnID}
            categoryData={column}
            isDragDisabled={isDragDisabled}
            searchValue={searchValue}
          />
        })}
    </div>
  )
}