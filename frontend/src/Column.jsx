import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Item from './Item'

const columnStyle = {
  "margin": "8px",
  "border": "1px solid lightgrey",
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


export default function Column({column, items}) {
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