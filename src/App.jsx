import React from 'react';
import '@atlaskit/css-reset'
import { DragDropContext } from 'react-beautiful-dnd';

import Column from './Column'
import initialData from './initialData';

const state = initialData
function onDragEnd() {

} 

export default function App() {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {state.columnOrder.map(columnID => {
        const column = state.columns[columnID];
        const tasks = column.taskIds.map(taskId => state.tasks[taskId]);
        return <Column key={column.id} column={column} tasks={tasks} />;
      })}
    </DragDropContext>
  );
}