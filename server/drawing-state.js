function createDrawingState() {
  return {
    operations: [],
    redoStack: []
  };
}

function addOperation(state, operation) {
  state.operations.push(operation);
  state.redoStack = []; // invalidate redo on new action
}

function undo(state) {
  if (state.operations.length === 0) return state.operations;

  const op = state.operations.pop();
  state.redoStack.push(op);

  return state.operations;
}

function redo(state) {
  if (state.redoStack.length === 0) return state.operations;

  const op = state.redoStack.pop();
  state.operations.push(op);

  return state.operations;
}

module.exports = {
  createDrawingState,
  addOperation,
  undo,
  redo
};
