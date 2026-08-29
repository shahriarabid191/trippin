import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  getCars,
  createCar,
  updateCar,
  deleteCar,
  bookCar,
  getMyBookings,
  cancelBooking
} from "../api/carAPI";


export default function BookCar() {

  const { user } = useContext(AuthContext);
  const isAdmin = user && user.role === "admin";

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("browse");

  const [showForm, setShowForm] = useState(false);
  const [editingID, setEditingID] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [bookingCar, setBookingCar] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingError, setBookingError] = useState("");



  async function loadCars() {

    try {

      setLoading(true);

      const data = await getCars();

      setCars(Array.isArray(data) ? data : []);

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

      loadCars();

    }
    else {

      loadBookings();

    }

  }, [view]);





  function clearForm() {

    setName("");

    setType("");

    setLocation("");

    setPricePerDay("");

    setPhotoUrl("");

    setEditingID(null);

    setShowForm(false);

  }





  async function saveCar() {

    if(!name.trim() || !pricePerDay)
      return;


    const carData = {
      name,
      type,
      location,
      pricePerDay,
      photoUrl
    };


    if(editingID) {

      await updateCar(editingID, carData);

    }
    else {

      await createCar(carData);

    }


    clearForm();

    loadCars();

  }





  function startEdit(car) {

    setEditingID(car.id);

    setName(car.name);

    setType(car.type || "");

    setLocation(car.location || "");

    setPricePerDay(car.price_per_day);

    setPhotoUrl(car.photo_url || "");

    setShowForm(true);

  }





  async function removeCar(id) {

    await deleteCar(id);

    loadCars();

  }





  function openBookingForm(car) {

    setBookingCar(car);

    setStartDate("");

    setEndDate("");

    setBookingNotes("");

    setBookingError("");

  }





  async function confirmBooking() {

    if(!startDate || !endDate)
      return;


    if(endDate < startDate) {

      setBookingError("End date cannot be before start date.");

      return;

    }


    const result = await bookCar(
      bookingCar.id,
      {
        startDate,
        endDate,
        notes: bookingNotes
      }
    );


    if(result.message && result.message.includes("cannot be before")) {

      setBookingError(result.message);

      return;

    }


    setBookingCar(null);

    alert("Car booked successfully!");

  }





  async function removeBooking(id) {

    await cancelBooking(id);

    loadBookings();

  }





  return (

    <div className="page">

      <main className="subpage-content">


        <h2>Book a Car</h2>

        <p className="subpage-subtitle">
          Search for and book rental cars or ride services for convenient local transportation.
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
            Browse Cars
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
              {editingID ? "Edit Car" : "New Car"}
            </h3>



            <input
              type="text"
              placeholder="Car name (e.g. Toyota Axio)..."
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



            <input
              type="text"
              placeholder="Type (e.g. Sedan, SUV, Motorbike)..."
              value={type}
              onChange={(e)=>setType(e.target.value)}
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
              onClick={saveCar}
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
          bookingCar &&

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
              Book {bookingCar.name}
            </h3>



            <label style={{ color:"#b7d7ef", display:"block", marginBottom:"4px" }}>
              Start date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e)=>setStartDate(e.target.value)}
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



            <label style={{ color:"#b7d7ef", display:"block", marginBottom:"4px" }}>
              End date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e)=>setEndDate(e.target.value)}
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



            {
              bookingError &&

              <p style={{ color:"#e05252", marginBottom:"12px" }}>
                {bookingError}
              </p>

            }



            <textarea
              placeholder="Any notes (optional)..."
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
              onClick={() => setBookingCar(null)}
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
             display:"grid",
             gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",
             gap:"20px",
             width:"100%"
            }}
          >

            {
              cars.map(car => (

                <div
                  key={car.id}
                  style={{
                    padding:"16px",
                    marginBottom:"12px",
                    background:"#1b2f42",
                    borderRadius:"8px"
                  }}
                >

            {
              car.photo_url &&

               <img
                src={car.photo_url}
                alt={car.name}
                style={{
                width:"100%",
                height:"180px",
                objectFit:"cover",
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
                      {car.name}
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
                          onClick={() => startEdit(car)}
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
                          onClick={() => removeCar(car.id)}
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
                    car.type &&

                    <p style={{ color:"#b7d7ef", margin:"4px 0" }}>
                      🚗 {car.type}
                    </p>

                  }



                  {
                    car.location &&

                    <p style={{ color:"#b7d7ef", margin:"4px 0" }}>
                      📍 {car.location}
                    </p>

                  }



                  <p style={{ color:"#fff", fontWeight:"bold", margin:"8px 0" }}>
                    ${Number(car.price_per_day).toFixed(2)} / day
                  </p>



                  {
                    !isAdmin &&

                    <button
                      onClick={() => openBookingForm(car)}
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
                      Book This Car
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
                You haven't booked any cars yet.
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
                      {booking.car_name}
                    </h3>

                    <p style={{ color:"#b7d7ef", margin:"4px 0" }}>
                      📅 {booking.start_date} to {booking.end_date} — {booking.location}
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