document.addEventListener('DOMContentLoaded', () => {
  let todos = {}

  const todoList = document.querySelector('.list')
  const todoTitle = document.querySelector('.title')

  document.querySelector('.add-form').addEventListener('submit', e => {
    e.preventDefault()
    const title = todoTitle.value
    if (title) {
      todoTitle.value = ''
      request({add: title})
    }
  })
  document.querySelector('.clear').onclick = () => {
    request({clear: true})
  }
  document.querySelector('.clear-ticked').onclick = () => {
    const api = []
    for (const key in todos) {
      if (todos[key].data.done) {
        api.push({delete: todos[key].data.id})
      }
    }
    if (api.length) {
      request(api)
    }
  }
  document.querySelector('.rewrite').onclick = () => {
    const title = todoTitle.value
    if (title) {
      todoTitle.value = ''
      const keys = Object.keys(todos)
      if (keys.length) {
        request({
          delete: todos[keys[keys.length - 1]].data.id,
          add: title
        })
      } else {
        request({
          add: title
        })
      }
    }
  }

  const api = {
    todos ({success, data}) {
      if (success) {
        todoList.innerHTML = ''
        todos = {}
        for (const todo of data) {
          this.add({success: true, data: todo})
        }
      }
    },
    add ({success, data}) {
      if (success) {
        const doneElement = document.createElement('input')
        doneElement.type = 'checkbox'
        doneElement.checked = data.done
        doneElement.onchange = () => request({toggle: data.id})

        const spanElement = document.createElement('span')
        spanElement.append(data.title)

        const titleElement = document.createElement('label')
        titleElement.append(doneElement, spanElement)

        const removeElement = document.createElement('button')
        removeElement.onclick = () => request({delete: data.id})
        removeElement.innerText = 'Remove'

        const todoElement = document.createElement('div')
        todoElement.append(titleElement)
        todoElement.append(removeElement)

        todoList.append(todoElement)
        todos[data.id] = {doneElement, todoElement, removeElement, titleElement, spanElement, data}
      }
    },
    delete ({success, data}) {
      if (success) {
        todos[data.id].todoElement.remove()
        delete todos[data.id]
      }
    },
    clear ({success}) {
      if (success) {
        for (const todo in todos) {
          todos[todo].todoElement.remove()
        }
        todos = {}
      }
    },
    toggle ({error, data}) {
      if (error) {
        todos[data.id].doneElement.checked = !todos[data.id].doneElement.checked
      } else {
        todos[data.id].data.done = !todos[data.id].data.done
      }
    }
  }

  request({todos: null})

  function request (body) {
    return fetch('/', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(data => data.json()).then(data => jap(api, data, false, false))
  }
})