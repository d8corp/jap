let todos = []

class Api {
  async todos () {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return todos
  }
  add (title) {
    if (!title) {
      throw Error('please provide some title')
    }
    const todo = {id: `${Date.now()}${Math.random()}`, title, done: false}
    todos.push(todo)
    return todo
  }
  delete (id) {
    let i = 0
    for (const todo of todos) {
      if (todo.id === id) {
        return todos.splice(i, 1)[0]
      }
      i++
    }
    throw Error('todo is not found')
  }
  toggle (id) {
    for (const todo of todos) {
      if (todo.id === id) {
        return {id, done: todo.done = !todo.done}
      }
    }
    throw Error('todo is not found')
  }
  clear () {
    todos = []
  }
}

module.exports = Api