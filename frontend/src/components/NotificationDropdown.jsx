import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from "../api/notificationAPI";

import {
    acknowledgeAlert
} from "../api/sosAlertAPI";


/*
 * Choose an icon based on notification type.
 */
function getNotificationIcon(type) {

    switch (type) {

        case "chat.message.sent":
            return "💬";

        case "chat.message.reacted":
            return "💬";

        case "buddy.request.sent":
            return "👥";

        case "buddy.request.accepted":
            return "✅";

        case "buddy.request.rejected":
            return "❌";

        case "sos.contact.request.sent":
            return "🚨";

        case "sos.contact.request.accepted":
            return "✅";

        case "sos.contact.request.rejected":
            return "❌";

        case "sos.triggered":
            return "🚨";

        case "sos.acknowledged":
            return "🛡️";

        case "shared_budget.created":
            return "💰";

        case "shared_budget.updated":
            return "💰";

        case "shared_budget.deleted":
            return "🗑️";

        case "payment.success":
            return "💳";

        case "payment.failed":
            return "⚠️";

        case "review.received":
            return "⭐";

        default:
            return "🔔";
    }

}


export default function NotificationDropdown({ refreshCount }) {

    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(true);

    const [acknowledgingId, setAcknowledgingId] = useState(null);

    const [markingAll, setMarkingAll] = useState(false);


    /*
     * Load notifications from the notification system.
     */
    const loadNotifications = async () => {

        try {

            setLoading(true);

            const data = await getNotifications();

            setNotifications(
                Array.isArray(data)
                    ? data
                    : data.notifications || []
            );

        }
        catch (error) {

            console.error(
                "Failed to load notifications",
                error
            );

        }
        finally {

            setLoading(false);

        }

    };


    /*
     * Load notifications when component mounts.
     */
    useEffect(() => {

        loadNotifications();

    }, []);


    /*
     * Common operation for changing a notification
     * from unread to read.
     */
    const markAsRead = async (notification) => {

        if (notification.is_read) {
            return;
        }


        const result = await markNotificationRead(
            notification.id
        );


        setNotifications(prev =>
            prev.map(item =>
                item.id === notification.id
                    ? {
                        ...item,
                        is_read: true,
                        read_at:
                            result.notification?.read_at ||
                            new Date().toISOString()
                    }
                    : item
            )
        );


        if (refreshCount) {
            refreshCount();
        }

    };


    /*
     * Clicking a notification:
     *
     * 1. Mark it as read if unread.
     * 2. Navigate to the destination stored
     *    inside notification.metadata.redirectTo.
     */
    const handleNotificationClick = async (
        notification
    ) => {

        try {

            await markAsRead(
                notification
            );

        }
        catch (error) {

            console.error(
                "Failed to mark notification as read",
                error
            );

            return;

        }


        const redirectTo =
            notification.metadata?.redirectTo;


        if (redirectTo) {

            navigate(
                redirectTo
            );

        }

    };


    /*
     * Mark a normal notification as read.
     */
    const handleMarkAsRead = async (
        event,
        notification
    ) => {

        event.stopPropagation();


        try {

            await markAsRead(
                notification
            );

        }
        catch (error) {

            console.error(
                "Failed to mark notification as read",
                error
            );

        }

    };


    /*
     * Mark all notifications as read.
     */
    const handleMarkAllAsRead = async () => {

        if (
            !notifications.some(
                notification => !notification.is_read
            )
        ) {
            return;
        }


        try {

            setMarkingAll(true);


            await markAllNotificationsRead();


            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    is_read: true,
                    read_at:
                        notification.read_at ||
                        new Date().toISOString()
                }))
            );


            if (refreshCount) {
                refreshCount();
            }

        }
        catch (error) {

            console.error(
                "Failed to mark all notifications as read",
                error
            );

        }
        finally {

            setMarkingAll(false);

        }

    };


    /*
     * Acknowledge an SOS alert.
     *
     * This does NOT navigate.
     * It only acknowledges the actual SOS alert
     * and marks the notification as read.
     */
    const handleAcknowledgeSOS = async (
        event,
        notification
    ) => {

        event.stopPropagation();


        const alertId =
            notification.metadata?.alertId;


        if (!alertId) {

            console.error(
                "SOS notification is missing alertId"
            );

            return;

        }


        try {

            setAcknowledgingId(
                notification.id
            );


            /*
             * Acknowledge actual SOS alert.
             */
            await acknowledgeAlert(
                alertId
            );


            /*
             * Mark notification as read.
             */
            await markAsRead(
                notification
            );

        }
        catch (error) {

            console.error(
                "Failed to acknowledge SOS alert",
                error
            );


            alert(
                error.message ||
                "Failed to acknowledge SOS alert"
            );

        }
        finally {

            setAcknowledgingId(null);

        }

    };


    /*
     * Number of unread notifications.
     */
    const unreadCount = notifications.filter(
        notification =>
            !notification.is_read
    ).length;


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
                boxShadow:
                    "0 8px 40px rgba(0,0,0,0.5)",
                border:
                    "1px solid rgba(99,179,237,0.18)",
                overflow: "hidden",
                zIndex: 1000
            }}
        >

            {/* Header */}

            <div
                style={{
                    padding: "14px 18px 12px",
                    borderBottom:
                        "1px solid rgba(99,179,237,0.12)",
                    background:
                        "linear-gradient(135deg, #0b1e30, #122a40)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >

                <strong
                    style={{
                        fontSize: "15px"
                    }}
                >
                    🔔 Notifications
                </strong>


                {unreadCount > 0 && (

                    <span
                        style={{
                            background: "#ef4444",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: "700",
                            borderRadius: "999px",
                            padding: "2px 8px"
                        }}
                    >
                        {unreadCount}
                    </span>

                )}


                {unreadCount > 0 && (

                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={markingAll}
                        style={{
                            marginLeft: "auto",
                            padding: "5px 9px",
                            borderRadius: "7px",
                            border:
                                "1px solid rgba(99,179,237,0.25)",
                            background: "transparent",
                            color: "#b7d7ef",
                            fontWeight: "600",
                            fontSize: "10px",
                            cursor:
                                markingAll
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                markingAll
                                    ? 0.6
                                    : 1
                        }}
                    >
                        {markingAll
                            ? "Marking..."
                            : "Mark all as read"}
                    </button>

                )}

            </div>


            {/* Notification list */}

            <div
                style={{
                    maxHeight: "360px",
                    overflowY: "auto"
                }}
            >

                {loading ? (

                    <div
                        style={{
                            padding: "32px 18px",
                            textAlign: "center",
                            color: "#64829e",
                            fontSize: "14px"
                        }}
                    >
                        Loading notifications...
                    </div>

                ) : notifications.length === 0 ? (

                    <div
                        style={{
                            padding: "32px 18px",
                            textAlign: "center",
                            color: "#4a6380",
                            fontSize: "14px"
                        }}
                    >

                        <div
                            style={{
                                fontSize: "32px",
                                marginBottom: "8px"
                            }}
                        >
                            🔕
                        </div>

                        No notifications

                    </div>

                ) : (

                    notifications.map(notification => (

                        <div
                            key={notification.id}

                            onClick={() =>
                                handleNotificationClick(
                                    notification
                                )
                            }

                            style={{
                                padding: "13px 18px",
                                borderBottom:
                                    "1px solid rgba(99,179,237,0.08)",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                                background:
                                    notification.is_read
                                        ? "transparent"
                                        : "rgba(59,130,246,0.08)",
                                transition:
                                    "background 0.15s",
                                cursor:
                                    notification.metadata?.redirectTo
                                        ? "pointer"
                                        : "default"
                            }}

                            onMouseEnter={e => {

                                e.currentTarget.style.background =
                                    "rgba(99,179,237,0.07)";

                            }}

                            onMouseLeave={e => {

                                e.currentTarget.style.background =
                                    notification.is_read
                                        ? "transparent"
                                        : "rgba(59,179,237,0.08)";

                            }}
                        >

                            {/* Icon */}

                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background:
                                        "rgba(59,130,246,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px",
                                    flexShrink: 0
                                }}
                            >
                                {getNotificationIcon(
                                    notification.type
                                )}
                            </div>


                            {/* Content */}

                            <div
                                style={{
                                    flex: 1,
                                    minWidth: 0
                                }}
                            >

                                {/* Title + unread indicator */}

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}
                                >

                                    <strong
                                        style={{
                                            fontSize: "14px",
                                            color: "#e2f0ff",
                                            flex: 1
                                        }}
                                    >
                                        {notification.title}
                                    </strong>


                                    {!notification.is_read && (

                                        <span
                                            style={{
                                                width: "7px",
                                                height: "7px",
                                                background: "#3b82f6",
                                                borderRadius: "50%",
                                                flexShrink: 0
                                            }}
                                        />

                                    )}

                                </div>


                                {/* Message */}

                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#8ba6bd",
                                        marginTop: "4px",
                                        lineHeight: "1.4"
                                    }}
                                >
                                    {notification.message}
                                </div>


                                {/* Status / actions */}

                                {notification.is_read ? (

                                    <div
                                        style={{
                                            marginTop: "9px",
                                            fontSize: "11px",
                                            color: "#6ee7b7",
                                            fontWeight: "600"
                                        }}
                                    >
                                        ✓{" "}
                                        {notification.type ===
                                            "sos.triggered"
                                            ? "Acknowledged"
                                            : "Read"}
                                    </div>

                                ) : (

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "8px",
                                            marginTop: "9px"
                                        }}
                                    >

                                        {/* SOS acknowledgement */}

                                        {notification.type ===
                                            "sos.triggered" && (

                                                <button
                                                    onClick={event =>
                                                        handleAcknowledgeSOS(
                                                            event,
                                                            notification
                                                        )
                                                    }

                                                    disabled={
                                                        acknowledgingId ===
                                                        notification.id
                                                    }

                                                    style={{
                                                        padding:
                                                            "6px 12px",
                                                        borderRadius:
                                                            "7px",
                                                        border:
                                                            "none",
                                                        background:
                                                            "#ef4444",
                                                        color:
                                                            "#fff",
                                                        fontWeight:
                                                            "700",
                                                        fontSize:
                                                            "11px",
                                                        cursor:
                                                            acknowledgingId ===
                                                                notification.id
                                                                ? "not-allowed"
                                                                : "pointer",
                                                        opacity:
                                                            acknowledgingId ===
                                                                notification.id
                                                                ? 0.6
                                                                : 1
                                                    }}
                                                >
                                                    {acknowledgingId ===
                                                        notification.id
                                                        ? "Acknowledging..."
                                                        : "Acknowledge"}
                                                </button>

                                            )}


                                        {/* Normal notification */}

                                        {notification.type !==
                                            "sos.triggered" && (

                                                <button
                                                    onClick={event =>
                                                        handleMarkAsRead(
                                                            event,
                                                            notification
                                                        )
                                                    }

                                                    style={{
                                                        padding:
                                                            "6px 12px",
                                                        borderRadius:
                                                            "7px",
                                                        border:
                                                            "1px solid rgba(99,179,237,0.25)",
                                                        background:
                                                            "transparent",
                                                        color:
                                                            "#b7d7ef",
                                                        fontWeight:
                                                            "600",
                                                        fontSize:
                                                            "11px",
                                                        cursor:
                                                            "pointer"
                                                    }}
                                                >
                                                    Mark as read
                                                </button>

                                            )}

                                    </div>

                                )}


                                {/* Timestamp */}

                                <div
                                    style={{
                                        fontSize: "10px",
                                        color: "#4f6b82",
                                        marginTop: "5px"
                                    }}
                                >

                                    {new Date(
                                        notification.created_at
                                    ).toLocaleString(
                                        undefined,
                                        {
                                            dateStyle: "medium",
                                            timeStyle: "short"
                                        }
                                    )}

                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>

    );

}
