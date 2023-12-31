import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { Droppable, DragDropContext } from 'react-beautiful-dnd';
import { isMobile } from 'react-device-detect';
import Item from './Item'
import { NewItemDialog } from './modals';
import { sendReorderedItem, sendNewItem, sendUpdatedItem, deleteItem } from './services';

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

function TitleBar({title, unit, verb, onNewItemSubmit, authorized}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

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

  const plusOnClick = () => {
    setDialogOpen(true);
  }

  return (
    <div style={divStyle}>
      <h3 style={titleSyle}>{title}</h3>
      {authorized && 
        <IconButton aria-label="Example" onClick={plusOnClick}>
          <AddIcon />
        </IconButton>
      }
      <NewItemDialog
        category={title}
        unit={unit}
        verb={verb}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onNewItemSubmit={onNewItemSubmit}
      />
    </div>
  )
}


function Category({categoryData, searchValue, isDragDisabled, authorized, selectedUser}) {
  const [data, setData] = useState(categoryData);

  const title = data.title;
  const items = data.items;
  const unit = data.unit;
  const verb = data.verb;

  const searchValueLowerCase = searchValue.toLowerCase();
  const indexedItems = items.map((item, index) => { return {'item': item, 'index': index} } );
  const displayItems = searchValue.length === 0 ? indexedItems : indexedItems.filter((entry) =>
    entry.item.content.toLowerCase().includes(searchValueLowerCase)
  );

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

  const onDragEnd = (result) => {
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
    const newItems = Array.from(data.items);
    const [item] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, item);
    const newData = {
      ...data,
      items: newItems
    }

    // This needs to be done initially or else we get a jitter affect
    // as the API needs a second to process the change
    // When the response comes in, react realizes it doesnt need to re-render
    // So it doesnt feel jittery
    setData(newData);

    // Send update to backend and hopefully get a response
    const changeDelta = createChangeDelta(destination.index, newItems);
    sendReorderedItem(changeDelta, selectedUser.user_guid).then(newItem => {
      // Re-render the old list if there is an error
      // TODO: toast message
      if (newItem === null) {
        setData(data);
        return;
      }

      // If no error, update the item with the new key
      // Unfortunately needs a re-render
      newItems[destination.index] = newItem;
      setData(newData);
    });
  };

  const onNewItemSubmit = (newtitle) => {
    const newItem = {
      id: "0",
      content: newtitle,
      order_key: ""
    };

    // Insert into item array at the top
    const newItems = Array.from(data.items);
    newItems.splice(0, 0, newItem);
    const newData = {
      ...data,
      items: newItems
    };

    // Send new item to backend
    const changeDelta = createChangeDelta(0, newItems);
    sendNewItem(changeDelta, selectedUser.user_guid).then(newItem => {
      // If the update was successful, re-render with the new item
      if (newItem !== null) {
        newItems[0] = newItem;
        setData(newData);
      }
    });
  };

  const OnItemEditSet = (index, newTitle) => {
    const newItems = Array.from(data.items);
    const editedItem = {...newItems[index]};
    editedItem.content = newTitle;

    const newData = {
      ...data,
      items: newItems
    };

    sendUpdatedItem(editedItem, selectedUser.user_guid).then(newItem => {
      if (newItem !== null) {
        newItems[index] = newItem;
        setData(newData);
      }
    })

  };

  const OnItemDeleteConfirm = (index) => {
    
    // Remove from list
    const newItems = Array.from(data.items);
    const [oldItem] = newItems.splice(index, 1);

    const newData = {
      ...data,
      items: newItems
    };


    deleteItem(oldItem, selectedUser.user_guid).then(removedItem => {
      if (removedItem === true) {
        setData(newData);
      }
    })

  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={columnStyle}>
        <TitleBar
          title={title}
          unit={unit}
          verb={verb}
          onNewItemSubmit={onNewItemSubmit}
          authorized={authorized}
        />
        <Droppable droppableId={data.id} type={title}>
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
                {displayItems.map((entry) =>
                  <Item
                    key={entry.item.id}
                    item={entry.item}
                    index={entry.index}
                    title={title}
                    isDragDisabled={isDragDisabled}
                    OnItemEditSet={OnItemEditSet}
                    OnItemDeleteConfirm={OnItemDeleteConfirm}
                    authorized={authorized}
                  />)}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </div>
    </DragDropContext>
  );
}


export default function Categories({loadedData, categories, searchValue, isDragDisabled, selectedCategory, authorized, selectedUser}) {
  if (isMobile) {
    if (selectedCategory) {
      const categoryData = loadedData[selectedCategory];
      return (
        <Category
          key={selectedCategory}
          categoryData={categoryData}
          isDragDisabled={isDragDisabled}
          searchValue={searchValue}
          authorized={authorized}
          selectedUser={selectedUser}
        />
      )
    }

    return <div/>
  }
  
  return (
    <div style={{display: "flex"}}>
      {categories.map(columnID => {
          const categoryData = loadedData[columnID];
          return (
            <Category
              key={columnID}
              categoryData={categoryData}
              isDragDisabled={isDragDisabled}
              searchValue={searchValue}
              authorized={authorized}
              selectedUser={selectedUser}
            />
          )
          
        })}
    </div>
  )
}