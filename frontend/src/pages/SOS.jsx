import { useEffect, useState } from "react";

import Footer from "../components/Footer";
import SOSButton from "../components/SOSButton";
import CountdownSOS from "../components/CountDownSOS";

import {
    sendSosRequest,
    getSosContacts,
    getSosRequests,
    acceptSosRequest,
    rejectSosRequest,
    removeSosContact,
    searchSosUsers
} from "../api/sosAPI";

import "./SOS.css";


export default function SOS() {

    const [username, setUsername] = useState("");

    const [contacts, setContacts] = useState([]);

    const [requests, setRequests] = useState([]);

    const [searchResults, setSearchResults] = useState([]);

    const [loading, setLoading] = useState(false);


    // Load SOS contacts and pending requests
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


    // Search users while typing
    async function handleSearch(value) {

        setUsername(value);


        if (!value.trim()) {

            setSearchResults([]);

            return;

        }


        try {

            const data = await searchSosUsers(
                value
            );


            setSearchResults(
                data.users || []
            );

        }
        catch (error) {

            console.error(error);

            setSearchResults([]);

        }

    }


    // Send SOS contact request
    async function handleSendRequest(
        selectedUsername
    ) {

        if (
            !selectedUsername ||
            !selectedUsername.trim()
        ) {
            return;
        }


        try {

            await sendSosRequest(
                selectedUsername
            );


            alert(
                "SOS contact request sent successfully"
            );


            setUsername("");

            setSearchResults([]);

            loadData();

        }
        catch (error) {

            alert(error.message);

        }

    }


    // Accept SOS contact request
    async function handleAccept(id) {

        try {

            await acceptSosRequest(id);


            alert(
                "SOS request accepted"
            );


            loadData();

        }
        catch (error) {

            alert(error.message);

        }

    }


    // Reject SOS contact request
    async function handleReject(id) {

        try {

            await rejectSosRequest(id);


            alert(
                "SOS request rejected"
            );


            loadData();

        }
        catch (error) {

            alert(error.message);

        }

    }


    // Remove SOS contact
    async function handleRemove(id) {

        try {

            await removeSosContact(id);


            alert(
                "SOS contact removed"
            );


            loadData();

        }
        catch (error) {

            alert(error.message);

        }

    }


    return (

        <div className="page sos-page">

            <main className="subpage-content sos-content">

                <h2>
                    SOS
                </h2>


                <p className="subpage-subtitle">
                    Quickly send emergency alerts to your trusted contacts.
                </p>


                {/* SOS ACTIONS */}

                <div
                    style={{
                        display: "flex",
                        gap: "40px",
                        flexWrap: "wrap",
                        marginBottom: "30px"
                    }}
                >

                    {/* Instant SOS */}

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
                                color: "#fff"
                            }}
                        >
                            Tap 3 times to send alert
                        </p>

                    </div>


                    {/* Countdown SOS */}

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


                {/* ADD SOS CONTACT */}

                <div
                    className="contact-card"
                    style={{
                        width: "100%",
                        maxWidth: "700px",
                        background: "#0b1e30",
                        border: "1px solid #b7d7ef",
                        marginBottom: "24px"
                    }}
                >

                    <h3
                        style={{
                            color: "#fff",
                            marginBottom: "24px"
                        }}
                    >
                        Search SOS Contact
                    </h3>


                    <input
                        type="text"
                        placeholder="Search username"
                        value={username}
                        onChange={(e) =>
                            handleSearch(
                                e.target.value
                            )
                        }
                        style={{
                            padding: "12px",
                            width: "100%",
                            borderRadius: "8px",
                            border: "1px solid #4f5c69",
                            background: "#1b2f42",
                            color: "#fff"
                        }}
                    />


                    {/* SEARCH RESULTS */}

                    {
                        searchResults.length > 0 && (

                            <div
                                style={{
                                    marginTop: "12px",
                                    width: "100%"
                                }}
                            >

                                {
                                    searchResults.map(user => (

                                        <div
                                            key={user.id}
                                            style={{
                                                padding: "12px",
                                                marginBottom: "8px",
                                                background: "#1b2f42",
                                                borderRadius: "8px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center"
                                            }}
                                        >

                                            <span
                                                style={{
                                                    color: "#fff"
                                                }}
                                            >
                                                {user.username}
                                            </span>


                                            <button
                                                onClick={() =>
                                                    handleSendRequest(
                                                        user.username
                                                    )
                                                }
                                                style={{
                                                    padding: "8px 16px",
                                                    borderRadius: "8px",
                                                    border: "none",
                                                    background: "#fff",
                                                    color: "#0b1e30",
                                                    fontWeight: "bold",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Add
                                            </button>

                                        </div>

                                    ))
                                }

                            </div>

                        )
                    }


                    {
                        username.trim() &&
                        searchResults.length === 0 && (

                            <p
                                style={{
                                    color: "#b7d7ef",
                                    marginTop: "12px"
                                }}
                            >
                                No users found.
                            </p>

                        )
                    }

                </div>


                {
                    loading && (

                        <p
                            style={{
                                color: "#fff"
                            }}
                        >
                            Loading...
                        </p>

                    )
                }


                {/* SOS REQUESTS + CONTACTS */}

                <div
                    style={{
                        width: "100%",
                        maxWidth: "800px"
                    }}
                >

                    {/* PENDING REQUESTS */}

                    <h3>
                        Pending Requests
                    </h3>


                    {
                        requests.length === 0 &&
                        !loading && (

                            <p>
                                No pending requests
                            </p>

                        )
                    }


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

                                    <strong>
                                        {request.username}
                                    </strong>

                                    {" sent you an SOS contact request"}

                                </p>


                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px"
                                    }}
                                >

                                    <button
                                        onClick={() =>
                                            handleAccept(
                                                request.id
                                            )
                                        }
                                    >
                                        Accept
                                    </button>


                                    <button
                                        onClick={() =>
                                            handleReject(
                                                request.id
                                            )
                                        }
                                    >
                                        Reject
                                    </button>

                                </div>

                            </div>

                        ))
                    }


                    {/* MY SOS CONTACTS */}

                    <h3
                        style={{
                            marginTop: "30px"
                        }}
                    >
                        My SOS Contacts
                    </h3>


                    {
                        contacts.length === 0 &&
                        !loading && (

                            <p>
                                You don't have any SOS contacts yet
                            </p>

                        )
                    }


                    {
                        contacts.map(contact => (

                            <div
                                key={contact.id}
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
                                        margin: 0,
                                        fontWeight: "600"
                                    }}
                                >
                                    {contact.username}
                                </p>


                                <button
                                    onClick={() =>
                                        handleRemove(
                                            contact.id
                                        )
                                    }
                                >
                                    Remove
                                </button>

                            </div>

                        ))
                    }

                </div>

            </main>


            <Footer />

        </div>

    );

}

