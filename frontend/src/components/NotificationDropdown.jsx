import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getReceivedAlerts,
    acknowledgeAlert
} from "../api/sosAlertAPI";


export default function NotificationDropdown({ refreshCount, chatNotifs = [] }) {

    const [alerts, setAlerts] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {

        loadAlerts();

    }, []);



    const loadAlerts = async () => {

        try {

            const data = await getReceivedAlerts();

            setAlerts(data.alerts || data);

        } catch (error) {

            console.error(
                "Failed to load notifications",
                error
            );

        }

    };



    const ackTheSOS = async (id) => {

        try {

            await acknowledgeAlert(id);


            setAlerts(prev =>
                prev.filter(
                    alert => alert.id !== id
                )
            );


            // update navbar badge
            if (refreshCount) {
                refreshCount();
            }


            alert("SOS alert acknowledged");


        } catch (error) {

            alert(error.message);

        }

    };


    const totalItems = alerts.length + chatNotifs.length;


    return (

        <div
            style={{
                position: "absolute",
                top: "45px",
                right: "0",
                width: "340px",
                background: "#0d1f30",
                color: "#e2f0ff",
                borderRadius: "16px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                border: "1px solid rgba(99,179,237,0.18)",
                overflow: "hidden",
                zIndex: 1000
            }}
        >

            {/* Header */}
            <div
                style={{
                    padding: "14px 18px 12px",
                    borderBottom: "1px solid rgba(99,179,237,0.12)",
                    fontWeight: "700",
                    fontSize: "15px",
                    background: "linear-gradient(135deg, #0b1e30, #122a40)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >
                🔔 Notifications
                {totalItems > 0 && (
                    <span
                        style={{
                            background: "#ef4444",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: "700",
                            borderRadius: "999px",
                            padding: "2px 8px",
                            marginLeft: "auto"
                        }}
                    >
                        {totalItems}
                    </span>
                )}
            </div>


            <div style={{ maxHeight: "360px", overflowY: "auto" }}>

                {totalItems === 0 ? (

                    <div
                        style={{
                            padding: "32px 18px",
                            textAlign: "center",
                            color: "#4a6380",
                            fontSize: "14px"
                        }}
                    >
                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔕</div>
                        No new notifications
                    </div>

                ) : (

                    <>

                        {/* ── Chat message notifications ── */}
                        {chatNotifs.map(notif => (

                            <div
                                key={`chat-${notif.sender_id}`}
                                style={{
                                    padding: "12px 18px",
                                    borderBottom: "1px solid rgba(99,179,237,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    cursor: "pointer",
                                    transition: "background 0.15s"
                                }}
                                onClick={() => {
                                    navigate('/travel-buddies');
                                    if (refreshCount) refreshCount();
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(99,179,237,0.07)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >

                                {/* Avatar */}
                                <div
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "700",
                                        fontSize: "15px",
                                        color: "#fff",
                                        flexShrink: 0
                                    }}
                                >
                                    {notif.sender_username?.[0]?.toUpperCase() ?? '?'}
                                </div>


                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            color: "#e2f0ff",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }}
                                    >
                                        💬 {notif.sender_username}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#64829e", marginTop: "2px" }}>
                                        Sent you {notif.unread_count} message{notif.unread_count > 1 ? 's' : ''} · Go to Travel Buddies
                                    </div>
                                </div>


                                <span
                                    style={{
                                        background: "#3b82f6",
                                        color: "#fff",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        borderRadius: "999px",
                                        padding: "2px 8px",
                                        flexShrink: 0
                                    }}
                                >
                                    {notif.unread_count}
                                </span>

                            </div>

                        ))}


                        {/* ── SOS alert notifications ── */}
                        {alerts.map(alert => (

                            <div
                                key={alert.id}
                                style={{
                                    padding: "12px 18px",
                                    borderBottom: "1px solid rgba(99,179,237,0.08)"
                                }}
                            >

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: "6px"
                                    }}
                                >
                                    <span style={{ fontSize: "18px" }}>🚨</span>
                                    <strong style={{ color: "#fca5a5" }}>SOS Alert</strong>
                                </div>


                                <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#d4e8f8" }}>
                                    <strong>{alert.sender_username}</strong> needs help
                                </p>


                                {
                                    alert.lat &&
                                    alert.long &&

                                    <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#64829e" }}>
                                        📍 {alert.lat}, {alert.long}
                                    </p>

                                }


                                <button
                                    onClick={() => ackTheSOS(alert.id)}
                                    style={{
                                        padding: "6px 14px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "#ef4444",
                                        color: "#fff",
                                        fontWeight: "700",
                                        fontSize: "12px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Acknowledge
                                </button>


                            </div>

                        ))}

                    </>

                )}

            </div>

        </div>

    );

}