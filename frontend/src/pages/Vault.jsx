import { useEffect, useState } from "react";

import {
  uploadFile,
  getFiles,
  deleteFile,
  updateFileName
} from "../api/vaultAPI";


export default function Vault() {



  const [files, setFiles] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);



  async function loadFiles() {

    try {

      setLoading(true);

      const data = await getFiles();

      setFiles(data);

    }
    catch (error) {

      console.error(error);

    }
    finally {

      setLoading(false);

    }

  }



  useEffect(() => {

    loadFiles();

  }, []);





  async function handleUpload() {

    if (!selectedFile)
      return;


    const result = await uploadFile(
      selectedFile
    );


    if (!result.ok) {

      alert(result.data.message);

      return;

    }


    alert(result.data.message);


    setSelectedFile(null);

    setShowForm(false);


    loadFiles();

  }




  async function handleDelete(id) {

    await deleteFile(
      id
    );


    loadFiles();

  }




async function handleRename(id, currentName) {


    const newName = prompt(
        "Enter new name:",
        currentName
    );



    if (!newName || newName === currentName)
        return;



    try {


        await updateFileName(
            id,
            newName
        );


        alert("Filename updated successfully");


        loadFiles();


    } catch(error) {


        alert(error.message);


    }

}


  return (

    <div className="page">

      <main className="subpage-content">


        <h2>My Vault</h2>

        <p className="subpage-subtitle">
          Store, organize, and access your important travel documents and files securely.
        </p>





        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "none",
            fontSize: "30px",
            cursor: "pointer",
            marginBottom: "24px"
          }}
        >
          +
        </button>





        {
          showForm &&

          <div
            className="contact-card"
            style={{
              width: "100%",
              maxWidth: "800px",
              background: "#0b1e30",
              border: "1px solid #b7d7ef",
              marginBottom: "24px"
            }}
          >

            <h3
              style={{
                color: "#fff",
                fontSize: "24px"
              }}
            >
              Upload File
            </h3>


            <input
              type="file"
              onChange={(e) =>
                setSelectedFile(e.target.files[0])
              }
              style={{
                color: "#fff",
                marginBottom: "15px"
              }}
            />


            <button
              onClick={handleUpload}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                background: "#fff",
                color: "#0b1e30",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Upload
            </button>



            <button
              onClick={() => {

                setShowForm(false);

                setSelectedFile(null);

              }}
              style={{
                marginLeft: "12px",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>


          </div>

        }





        {
          loading &&

          <p style={{ color: "#fff" }}>
            Loading...
          </p>

        }





        <div
          style={{
            width: "100%",
            maxWidth: "800px"
          }}
        >


          {
            files.map(file => (

              <div
                key={file.id}
                style={{
                  padding: "16px",
                  marginBottom: "12px",
                  background: "#1b2f42",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >


                <div>

                  <h3
                    style={{
                      color: "#fff",
                      marginTop: 0
                    }}
                  >
                    📄 {file.display_name}
                  </h3>


                  <p
                    style={{
                      color: "#fff",
                      margin: 0
                    }}
                  >
                    {file.mime_type}
                  </p>


                </div>





                <div
                  style={{
                    display: "flex",
                    gap: "12px"
                  }}
                >

                  <a
                    href={`http://localhost:5050/${file.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#fff",
                      color: "#0b1e30",
                      borderRadius: "8px",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <span className="material-symbols-outlined">
                      open_in_new
                    </span>
                  </a>





                  <button
                    onClick={() =>
                      handleRename(
                        file.id,
                        file.display_name
                      )
                    }
                    title="Edit"
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <span className="material-symbols-outlined">
                      edit
                    </span>
                  </button>



                  <button
                    onClick={() => handleDelete(file.id)}
                    title="Delete"
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
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