import { useEffect, useState } from "react";

import SOSButton from "../components/SOSButton";
import CountdownSOS from "../components/CountDownSOS";

import {
    sendSosRequest,
    getSosContacts,
    getSosRequests,
    acceptSosRequest,
    rejectSosRequest
} from "../api/sosAPI";



export default function SOS() {


    const [username, setUsername] = useState("");

    const [contacts, setContacts] = useState([]);

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(false);



    async function loadData() {

        try {

            setLoading(true);


            const contactData = await getSosContacts();

            const requestData = await getSosRequests();


            setContacts(
                contactData.contacts || contactData
            );


            setRequests(
                requestData.requests || requestData
            );


        }
        catch (error) {

            console.error(error);

        }
        finally {

            setLoading(false);

        }

    }




    useEffect(() => {

        loadData();

    }, []);





    async function handleSendRequest() {


        if (!username)
            return;


        try {


            await sendSosRequest(username);


            alert("SOS request sent successfully");


            setUsername("");


        }
        catch (error) {

            alert(error.message);

        }

    }





    async function handleAccept(id) {


        await acceptSosRequest(id);


        alert(
            "SOS request accepted"
        );


        loadData();

    }




    async function handleReject(id) {


        await rejectSosRequest(id);


        alert(
            "SOS request rejected"
        );


        loadData();

    }





    return (


        <div className="page">


            <main className="subpage-content">


                <h2>
                    SOS
                </h2>


                <p className="subpage-subtitle">
                    Quickly send emergency alerts to your trusted contacts.
                </p>





                <div
                    style={{
                        display: "flex",
                        gap: "40px",
                        flexWrap: "wrap",
                        marginBottom: "30px"
                    }}
                >


                    <div
                        className="contact-card"
                        style={{
                            background: "#0b1e30",
                            border: "1px solid #b7d7ef",
                            width: "300px",
                            textAlign: "center"
                        }}
                    >

                        <h3
                            style={{
                                color: "#fff",
                                marginBottom: "20px"
                            }}
                        >
                            Instant SOS
                        </h3>


                        <SOSButton />


                        <p
                            style={{
                                color: "#fff",
                            }}
                        >
                            Tap 3 times to send alert
                        </p>


                    </div>





                    <div
                        className="contact-card"
                        style={{
                            background: "#0b1e30",
                            border: "1px solid #b7d7ef",
                            width: "350px"
                        }}
                    >

                        <CountdownSOS />

                    </div>


                </div>






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
                            color: "#fff"
                        }}
                    >
                        Add SOS Contact
                    </h3>



                    <input
                        type="text"
                        placeholder="Search username"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        style={{
                            padding: "12px",
                            width: "70%",
                            borderRadius: "8px",
                            border: "1px solid #4f5c69",
                            background: "#1b2f42",
                            color: "#fff",
                            marginRight: "12px"
                        }}
                    />



                    <button
                        onClick={handleSendRequest}
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
                        Send Request
                    </button>


                </div>







                {
                    loading &&

                    <p>
                        Loading...
                    </p>

                }





                <div
                    style={{
                        width: "100%",
                        maxWidth: "800px"
                    }}
                >




                    <h3>
                        Pending Requests
                    </h3>




                    {
                        requests.map(request => (


                            <div
                                key={request.id}
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


                                <p
                                    style={{
                                        color: "#fff",
                                        margin: 0
                                    }}
                                >
                                    <strong>{request.username}</strong> sent you an SOS contact request
                                </p>



                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px"
                                    }}
                                >

                                    <button
                                        onClick={() =>
                                            handleAccept(request.id)
                                        }
                                    >
                                        Accept
                                    </button>


                                    <button
                                        onClick={() =>
                                            handleReject(request.id)
                                        }
                                    >
                                        Reject
                                    </button>


                                </div>


                            </div>


                        ))
                    }




                    <h3
                        style={{
                            marginTop: "30px"
                        }}
                    >
                        My SOS Contacts
                    </h3>





                    {
                        contacts.map(contact => (


                            <div
                                key={contact.id}
                                style={{
                                    padding: "16px",
                                    marginBottom: "12px",
                                    background: "#1b2f42",
                                    borderRadius: "8px"
                                }}
                            >

                                <p
                                    style={{
                                        color: "#fff",
                                        margin: 0
                                    }}
                                >
                                    {contact.username}
                                </p>


                            </div>


                        ))
                    }



                </div>



            </main>


        </div>


    );

}