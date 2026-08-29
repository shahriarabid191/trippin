import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  getGuides,
  createGuide,
  updateGuide,
  deleteGuide,
  bookGuide,
  getMyBookings,
  cancelBooking
} from "../api/guideAPI";


export default function BookGuide() {

  const { user } = useContext(AuthContext);
  const isAdmin = user && user.role === "admin";

  const [guides, setGuides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("browse");

  const [showForm, setShowForm] = useState(false);
  const [editingID, setEditingID] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [bookingGuide, setBookingGuide] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");



  async function loadGuides() {

    try {

      setLoading(true);

      const data = await getGuides();

      setGuides(Array.isArray(data) ? data : []);

    }
    catch(error) {

      console.error(error);

    }
    finally {

      setLoading(false);

    }

  }



  async function loadBookings() {

    try {

      setLoading(true);

      const data = await getMyBookings();

      setBookings(Array.isArray(data) ? data : []);

    }
    catch(error) {

      console.error(error);

    }
    finally {

      setLoading(false);

    }

  }



  useEffect(() => {

    if(view === "browse") {

      loadGuides();

    }
    else {

      loadBookings();

    }

  }, [view]);





  function clearForm() {

    setName("");

    setBio("");

    setLocation("");

    setPricePerDay("");

    setPhotoUrl("");

    setEditingID(null);

    setShowForm(false);

  }





  async function saveGuide() {

    if(!name.trim() || !pricePerDay)
      return;


    const guideData = {
      name,
      bio,
      location,
      pricePerDay,
      photoUrl
    };


    if(editingID) {

      await updateGuide(editingID, guideData);

    }
    else {

      await createGuide(guideData);

    }


    clearForm();

    loadGuides();

  }





  function startEdit(guide) {

    setEditingID(guide.id);

    setName(guide.name);

    setBio(guide.bio || "");

    setLocation(guide.location || "");

    setPricePerDay(guide.price_per_day);

    setPhotoUrl(guide.photo_url || "");

    setShowForm(true);

  }





  async function removeGuide(id) {

    await deleteGuide(id);

    loadGuides();

  }





  function openBookingForm(guide) {

    setBookingGuide(guide);

    setBookingDate("");

    setBookingNotes("");

  }





  async function confirmBooking() {

    if(!bookingDate)
      return;


    await bookGuide(
      bookingGuide.id,
      {
        bookingDate,
        notes: bookingNotes
      }
    );


    setBookingGuide(null);

    alert("Guide booked successfully!");

  }





  async function removeBooking(id) {

    await cancelBooking(id);

    loadBookings();

  }





  return (

    <div className="page">

      <main className="subpage-content">


        <h2>Book a Guide</h2>

        <p className="subpage-subtitle">
          Browse available tour guides and book their services for personalized sightseeing.
        </p>



        <div
          style={{
            display:"flex",
            gap:"12px",
            marginBottom:"24px"
          }}
        >

          <button
            onClick={() => setView("browse")}
            style={{
              padding:"10px 20px",
              borderRadius:"8px",
              border:"none",
              cursor:"pointer",
              background: view === "browse" ? "#fff" : "#1b2f42",
              color: view === "browse" ? "#0b1e30" : "#fff",
              fontWeight:"bold"
            }}
          >
            Browse Guides
          </button>

          <button
            onClick={() => setView("bookings")}
            style={{
              padding:"10px 20px",
              borderRadius:"8px",
              border:"none",
              cursor:"pointer",
              background: view === "bookings" ? "#fff" : "#1b2f42",
              color: view === "bookings" ? "#0b1e30" : "#fff",
              fontWeight:"bold"
            }}
          >
            My Bookings
          </button>

        </div>





        {
          view === "browse" && isAdmin &&

          <button
            onClick={() => {
              clearForm();
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
              {editingID ? "Edit Guide" : "New Guide"}
            </h3>



            <input
              type="text"
              placeholder="Guide name..."
              value={name}
              onChange={(e)=>setName(e.target.value)}
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
              placeholder="Short bio..."
              value={bio}
              onChange={(e)=>setBio(e.target.value)}
              rows={3}
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



            <input
              type="text"
              placeholder="Location..."
              value={location}
              onChange={(e)=>setLocation(e.target.value)}
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



            <input
              type="number"
              placeholder="Price per day..."
              value={pricePerDay}
              onChange={(e)=>setPricePerDay(e.target.value)}
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



            <input
              type="text"
              placeholder="Photo URL (optional)..."
              value={photoUrl}
              onChange={(e)=>setPhotoUrl(e.target.value)}
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
              onClick={saveGuide}
              style={{
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
          bookingGuide &&

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
              Book {bookingGuide.name}
            </h3>



            <input
              type="date"
              value={bookingDate}
              onChange={(e)=>setBookingDate(e.target.value)}
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
              placeholder="Any notes for the guide (optional)..."
              value={bookingNotes}
              onChange={(e)=>setBookingNotes(e.target.value)}
              rows={3}
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



            <button
              onClick={confirmBooking}
              style={{
                padding:"12px 24px",
                borderRadius:"8px",
                border:"none",
                background:"#fff",
                color:"#0b1e30",
                fontWeight:"bold",
                cursor:"pointer"
              }}
            >
              Confirm Booking
            </button>



            <button
              onClick={() => setBookingGuide(null)}
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





        {
          view === "browse" &&

          <div
            style={{
              width:"100%",
              maxWidth:"800px"
            }}
          >

            {
              guides.map(guide => (

                <div
                  key={guide.id}
                  style={{
                    padding:"16px",
                    marginBottom:"12px",
                    background:"#1b2f42",
                    borderRadius:"8px"
                  }}
                >


             {
              guide.photo_url &&

             <img
              src={guide.photo_url}
              alt={guide.name}
              style={{
              width:"100%",
              height:"220px",
              objectFit:"contain",
             
              borderRadius:"8px",
              marginBottom:"12px", 
              
              
              
           }}
         />
        }




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
                      {guide.name}
                    </h3>



                    {
                      isAdmin &&

                      <div
                        style={{
                          display:"flex",
                          gap:"12px"
                        }}
                      >

                        <button
                          onClick={() => startEdit(guide)}
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
                          onClick={() => removeGuide(guide.id)}
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



                  {
                    guide.location &&

                    <p style={{ color:"#b7d7ef", margin:"4px 0" }}>
                      📍 {guide.location}
                    </p>

                  }



                  {
                    guide.bio &&

                    <p style={{ color:"#b7d7ef", margin:"4px 0" }}>
                      {guide.bio}
                    </p>

                  }



                  <p style={{ color:"#fff", fontWeight:"bold", margin:"8px 0" }}>
                    ${Number(guide.price_per_day).toFixed(2)} / day
                  </p>



                  {
                    !isAdmin &&

                    <button
                      onClick={() => openBookingForm(guide)}
                      style={{
                        padding:"10px 20px",
                        borderRadius:"8px",
                        border:"none",
                        background:"#fff",
                        color:"#0b1e30",
                        fontWeight:"bold",
                        cursor:"pointer"
                      }}
                    >
                      Book This Guide
                    </button>

                  }


                </div>

              ))
            }


          </div>

        }





        {
          view === "bookings" &&

          <div
            style={{
              width:"100%",
              maxWidth:"800px"
            }}
          >

            {
              bookings.length === 0 && !loading &&

              <p style={{ color:"#b7d7ef" }}>
                You haven't booked any guides yet.
              </p>

            }



            {
              bookings.map(booking => (

                <div
                  key={booking.id}
                  style={{
                    padding:"16px",
                    marginBottom:"12px",
                    background:"#1b2f42",
                    borderRadius:"8px",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"space-between"
                  }}
                >

                  <div>

                    <h3 style={{ color:"#fff", margin:0 }}>
                      {booking.guide_name}
                    </h3>

                    <p style={{ color:"#b7d7ef", margin:"4px 0" }}>
                       📅 {booking.booking_date.split("T")[0]} — {booking.location}
                    </p>

                    <p style={{ color:"#b7d7ef", margin:"4px 0" }}>
                      Status: {booking.status}
                    </p>

                    {
                      booking.notes &&

                      <p style={{ color:"#b7d7ef", margin:"4px 0" }}>
                        Notes: {booking.notes}
                      </p>

                    }

                  </div>



                  <button
                    onClick={() => removeBooking(booking.id)}
                    title="Cancel Booking"
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

              ))
            }


          </div>

        }


      </main>


    </div>

  );

} 