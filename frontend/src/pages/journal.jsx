import { useEffect, useState } from "react";

import {
  getJournals,
  getCommunityJournals,
  createJournal,
  deleteJournal,
  updateJournal
} from "../api/journalAPI";


export default function Journal() {

  const [journals, setJournals] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editingID, setEditingID] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [view, setView] = useState("mine");



  async function loadJournals() {

    try {

      setLoading(true);

      const data =
        view === "mine"
        ? await getJournals()
        : await getCommunityJournals();

      setJournals(data);

    }
    catch(error) {

      console.error(error);

    }
    finally {

      setLoading(false);

    }

  }



  useEffect(() => {

    loadJournals();

  }, [view]);





  async function saveJournal() {

    if(!title.trim() || !content.trim())
      return;


    if(editingID) {

      await updateJournal(
        editingID,
        {
          title,
          content,
          isPublic
        }
      );

    }
    else {

      await createJournal(
        {
          title,
          content,
          isPublic
        }
      );

    }


    clearForm();

    loadJournals();

  }





  function startEdit(journal) {

    setEditingID(journal.id);

    setTitle(journal.title);

    setContent(journal.content);

    setIsPublic(journal.is_public);

    setShowForm(true);

  }





  function clearForm() {

    setTitle("");

    setContent("");

    setIsPublic(false);

    setEditingID(null);

    setShowForm(false);

  }





  async function removeJournal(id) {

    await deleteJournal(id);

    loadJournals();

  }





  return (

    <div className="page">

      <main className="subpage-content">


        <h2>Travel Journal</h2>

        <p className="subpage-subtitle">
          Write about your travels, and choose to keep them private or share them with the community.
        </p>



        <div
          style={{
            display:"flex",
            gap:"12px",
            marginBottom:"24px"
          }}
        >

          <button
            onClick={() => setView("mine")}
            style={{
              padding:"10px 20px",
              borderRadius:"8px",
              border:"none",
              cursor:"pointer",
              background: view === "mine" ? "#fff" : "#1b2f42",
              color: view === "mine" ? "#0b1e30" : "#fff",
              fontWeight:"bold"
            }}
          >
            My Journals
          </button>

          <button
            onClick={() => setView("community")}
            style={{
              padding:"10px 20px",
              borderRadius:"8px",
              border:"none",
              cursor:"pointer",
              background: view === "community" ? "#fff" : "#1b2f42",
              color: view === "community" ? "#0b1e30" : "#fff",
              fontWeight:"bold"
            }}
          >
            Community
          </button>

        </div>





        {
          view === "mine" &&

          <button
            onClick={() => {

              setEditingID(null);

              setTitle("");

              setContent("");

              setIsPublic(false);

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

        }





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
              {editingID ? "Edit Entry" : "New Entry"}
            </h3>



            <input
              type="text"
              placeholder="Title..."
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



            <textarea
              placeholder="Write about your trip..."
              value={content}
              onChange={(e)=>setContent(e.target.value)}
              rows={6}
              style={{
                width:"100%",
                padding:"12px",
                marginBottom:"12px",
                borderRadius:"8px",
                border:"1px solid #4f5c69",
                background:"#1b2f42",
                color:"#fff",
                resize:"vertical"
              }}
            />



            <label
              style={{
                display:"flex",
                alignItems:"center",
                gap:"8px",
                color:"#fff",
                marginBottom:"12px",
                cursor:"pointer"
              }}
            >

              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />

              Share with the community

            </label>



            <button
              onClick={saveJournal}
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
            journals.map(journal => (

              <div
                key={journal.id}
                style={{
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
                    justifyContent:"space-between",
                    marginBottom:"8px"
                  }}
                >

                  <h3
                    style={{
                      color:"#fff",
                      margin:0
                    }}
                  >
                    {journal.title}
                  </h3>



                  {
                    view === "mine" &&

                    <div
                      style={{
                        display:"flex",
                        gap:"12px"
                      }}
                    >

                      <button
                        onClick={() => startEdit(journal)}
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
                        onClick={() => removeJournal(journal.id)}
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

                  }

                </div>



                <p
                  style={{
                    color:"#b7d7ef",
                    whiteSpace:"pre-wrap"
                  }}
                >
                  {journal.content}
                </p>



                {
                  view === "mine" &&

                  <span
                    style={{
                      fontSize:"12px",
                      color: journal.is_public ? "#7fd97f" : "#999"
                    }}
                  >
                    {journal.is_public ? "Public" : "Private"}
                  </span>

                }


              </div>

            ))
          }


        </div>


      </main>


    </div>

  );

}