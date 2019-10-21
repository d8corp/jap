class Todo {
  constructor () {
    this._todos = []
  }
  todos () {
    return this._todos
  }
  add (title) {
    if (!title) {
      throw Error('please provide some title')
    }
    const todo = {id: `${Date.now()}${Math.random()}`, title, done: false}
    this._todos.push(todo)
    return todo
  }
  delete (id) {
    let i = 0
    for (const todo of this._todos) {
      if (todo.id === id) {
        return this._todos.splice(i, 1)[0]
      }
      i++
    }
    throw Error('todo is not found')
  }
  toggle (id) {
    for (const todo of this._todos) {
      if (todo.id === id) {
        return {id, done: todo.done = !todo.done}
      }
    }
    throw Error('todo is not found')
  }
  clear () {
    this._todos = []
  }
}

module.exports = Todo