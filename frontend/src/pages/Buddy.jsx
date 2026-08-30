import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import BuddyChat from "../components/BuddyChat";

import {
    sendTravelBuddyRequest,
    getTravelBuddies,
    getTravelBuddyRequests,
    acceptTravelBuddyRequest,
    rejectTravelBuddyRequest,
    removeTravelBuddy,
    searchTravelBuddyUsers
} from "../api/buddyAPI";


export default function TravelBuddies() {


    const [username, setUsername] = useState("");

    const [buddies, setBuddies] = useState([]);

    const [requests, setRequests] = useState([]);

    const [searchResults, setSearchResults] = useState([]);

    const [loading, setLoading] = useState(false);

    const [chatBuddy, setChatBuddy] = useState(null);


    async function loadData() {

        try {

            setLoading(true);


            const buddyData = await getTravelBuddies();

            const requestData = await getTravelBuddyRequests();


            setBuddies(
                buddyData.buddies || buddyData
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


    async function handleSearch(value) {

        setUsername(value);


        if (!value.trim()) {

            setSearchResults([]);

            return;

        }


        try {

            const data =
                await searchTravelBuddyUsers(value);


            setSearchResults(
                data.users || []
            );

        }
        catch (error) {

            console.error(error);

            setSearchResults([]);

        }

    }


    async function handleSendRequest(selectedUsername) {

        if (!selectedUsername || !selectedUsername.trim())
            return;


        try {

            await sendTravelBuddyRequest(
                selectedUsername
            );


            alert(
                "Travel buddy request sent successfully"
            );


            setUsername("");

            setSearchResults([]);


            loadData();

        }
        catch (error) {

            alert(error.message);

        }

    }


    async function handleAccept(id) {

        try {

            await acceptTravelBuddyRequest(id);


            alert(
                "Travel buddy request accepted"
            );


            loadData();

        }
        catch (error) {

            alert(error.message);

        }

    }


    async function handleReject(id) {

        try {

            await rejectTravelBuddyRequest(id);


            alert(
                "Travel buddy request rejected"
            );


            loadData();

        }
        catch (error) {

            alert(error.message);

        }

    }


    async function handleRemove(id) {

        try {

            await removeTravelBuddy(id);


            alert(
                "Travel buddy removed"
            );


            loadData();

        }
        catch (error) {

            alert(error.message);

        }

    }


    return (

        <div className="page travel-buddies-page">

            <main className="subpage-content travel-buddies-content">


                <h2>
                    Travel Buddies
                </h2>


                <p className="subpage-subtitle">
                    Connect with other travelers and plan your journeys together.
                </p>


                {/* ADD TRAVEL BUDDY */}

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
                        Search Travel Buddy
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
                            color: "#fff",
                            marginRight: "12px"
                        }}
                    />


                    {/* SEARCH RESULTS */}

                    {
                        searchResults.length > 0 &&

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

                    }


                    {
                        username.trim() &&
                        searchResults.length === 0 &&

                        <p
                            style={{
                                color: "#b7d7ef",
                                marginTop: "12px"
                            }}
                        >
                            No users found.
                        </p>

                    }

                </div>


                {
                    loading &&

                    <p
                        style={{
                            color: "#fff"
                        }}
                    >
                        Loading...
                    </p>

                }


                {/* PENDING REQUESTS */}

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
                        requests.length === 0 && !loading &&

                        <p>
                            No pending requests
                        </p>

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

                                    {" sent you a travel buddy request"}

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


                    {/* MY TRAVEL BUDDIES */}

                    <h3
                        style={{
                            marginTop: "30px"
                        }}
                    >
                        My Travel Buddies
                    </h3>


                    {
                        buddies.length === 0 && !loading &&

                        <p>
                            You don't have any travel buddies yet
                        </p>

                    }


                    {
                        buddies.map(buddy => (

                            <div
                                key={buddy.id}
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
                                    {buddy.username}
                                </p>


                                <div style={{ display: "flex", gap: "10px" }}>

                                    <button
                                        onClick={() => setChatBuddy(buddy)}
                                        style={{
                                            padding: "8px 18px",
                                            borderRadius: "8px",
                                            border: "none",
                                            background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                                            color: "#fff",
                                            fontWeight: "700",
                                            cursor: "pointer",
                                            fontSize: "13px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            transition: "opacity 0.2s"
                                        }}
                                    >
                                        💬 Chat
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleRemove(
                                                buddy.id
                                            )
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>

                            </div>

                        ))
                    }


                    {/* BUDDY CHAT PANEL */}
                    {
                        chatBuddy &&
                        <BuddyChat
                            buddy={chatBuddy}
                            onClose={() => setChatBuddy(null)}
                        />
                    }

                </div>


            </main>


            <Footer />

        </div>

    );

}