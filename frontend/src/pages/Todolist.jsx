import { useEffect, useState } from "react";

import {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo
} from "../api/todoAPI";


export default function TodoList() {

  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingID, setEditingID] = useState(null);
  const [showForm, setShowForm] = useState(false);



  async function loadTodos() {

    try {

      setLoading(true);

      const data = await getTodos();

      setTodos(data);

    }
    catch(error) {

      console.error(error);

    }
    finally {

      setLoading(false);

    }

  }



  useEffect(() => {

    loadTodos();

  }, []);





  async function saveTodo() {

    if(!title.trim())
      return;


    if(editingID) {

      const currentTodo = todos.find(
        todo => todo.id === editingID
      );


      await updateTodo(
        editingID,
        {
          title,
          completed: currentTodo.completed
        }
      );

    }
    else {

      await createTodo(
        {
          title,
          completed:false
        }
      );

    }


    clearForm();

    loadTodos();

  }





  async function toggleTodo(todo) {

    await updateTodo(
      todo.id,
      {
        title:todo.title,
        completed:!todo.completed
      }
    );


    loadTodos();

  }





  function startEdit(todo) {

    setEditingID(todo.id);

    setTitle(todo.title);

    setShowForm(true);

  }





  function clearForm() {

    setTitle("");

    setEditingID(null);

    setShowForm(false);

  }





  async function removeTodo(id) {

    await deleteTodo(id);

    loadTodos();

  }





  return (

    <div className="page">

      <main className="subpage-content">


        <h2>My Todo List</h2>

        <p className="subpage-subtitle">
          Plan your tasks, track progress, and stay organized throughout your journey.
        </p>



        <button
          onClick={() => {

            setEditingID(null);

            setTitle("");

            setShowForm(true);

          }}
          style={{
            width:"50px",
            height:"50px",
            borderRadius:"50%",
            border:"none",
            fontSize:"30px",
            cursor:"pointer",
            marginBottom:"24px"
          }}
        >
          +
        </button>





        {
          showForm &&

          <div
            className="contact-card"
            style={{
              width:"100%",
              maxWidth:"800px",
              background:"#0b1e30",
              border:"1px solid #b7d7ef",
              marginBottom:"24px"
            }}
          >

            <h3
              style={{
                color:"#fff",
                fontSize:"24px",
                marginBottom:"16px"
              }}
            >
              {editingID ? "Edit Task" : "New Task"}
            </h3>



            <input
              type="text"
              placeholder="Enter a task..."
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              style={{
                width:"100%",
                padding:"12px",
                marginBottom:"12px",
                borderRadius:"8px",
                border:"1px solid #4f5c69",
                background:"#1b2f42",
                color:"#fff"
              }}
            />



            <button
              onClick={saveTodo}
              style={{
                marginTop:"12px",
                padding:"12px 24px",
                borderRadius:"8px",
                border:"none",
                background:"#fff",
                color:"#0b1e30",
                fontWeight:"bold",
                cursor:"pointer"
              }}
            >
              {editingID ? "Update" : "Save"}
            </button>



            <button
              onClick={clearForm}
              style={{
                marginLeft:"12px",
                padding:"12px 24px",
                borderRadius:"8px",
                border:"none",
                cursor:"pointer"
              }}
            >
              Cancel
            </button>


          </div>

        }





        {
          loading &&

          <p style={{color:"#fff"}}>
            Loading...
          </p>

        }





        <div
          style={{
            width:"100%",
            maxWidth:"800px"
          }}
        >

          {
            todos.map(todo => (

              <div
                key={todo.id}
                style={{
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"space-between",
                  padding:"16px",
                  marginBottom:"12px",
                  background:"#1b2f42",
                  borderRadius:"8px"
                }}
              >



                <div
                  style={{
                    display:"flex",
                    alignItems:"center",
                    gap:"12px",
                    flex:1
                  }}
                >

                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                  />



                  <span
                    style={{
                      color:"#fff",
                      textDecoration:
                        todo.completed
                        ? "line-through"
                        : "none"
                    }}
                  >
                    {todo.title}
                  </span>


                </div>





                <div
                  style={{
                    display:"flex",
                    gap:"12px"
                  }}
                >



                  <button
                    onClick={() => startEdit(todo)}
                    title="Edit"
                    style={{
                      width:"40px",
                      height:"40px",
                      border:"none",
                      borderRadius:"8px",
                      cursor:"pointer",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center"
                    }}
                  >

                    <span className="material-symbols-outlined">
                      edit
                    </span>

                  </button>





                  <button
                    onClick={() => removeTodo(todo.id)}
                    title="Delete"
                    style={{
                      width:"40px",
                      height:"40px",
                      border:"none",
                      borderRadius:"8px",
                      cursor:"pointer",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center"
                    }}
                  >

                    <span className="material-symbols-outlined">
                      delete
                    </span>

                  </button>



                </div>


              </div>

            ))
          }


        </div>


      </main>


    </div>

  );

}