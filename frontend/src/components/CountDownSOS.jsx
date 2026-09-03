import { useState, useEffect, useRef } from "react";
import { triggerSosAlert } from "../api/sosAlertAPI";


export default function CountdownSOS() {

    const [minutes, setMinutes] = useState("");
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [sending, setSending] = useState(false);

    const sent = useRef(false);


    const sendAlert = () => {

        if (sent.current || sending) {
            return;
        }

        sent.current = true;

        // Immediate feedback
        setSending(true);


        if (!navigator.geolocation) {

            setSending(false);

            alert(
                "Geolocation is not supported by your browser"
            );

            return;

        }


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const response =
                        await triggerSosAlert({

                            lat:
                                position.coords.latitude,

                            long:
                                position.coords.longitude,

                            type: "COUNTDOWN"

                        });


                    if (response.error) {

                        alert(
                            response.error
                        );

                        return;

                    }


                    alert(
                        "Countdown SOS sent"
                    );


                } catch (error) {

                    alert(
                        error.message ||
                        "Failed to send Countdown SOS"
                    );

                } finally {

                    setSending(false);

                }

            },

            (error) => {

                console.error(
                    "Geolocation error:",
                    error
                );

                setSending(false);


                alert(
                    "Unable to get your location"
                );

            }

        );

    };



    useEffect(() => {

        if (!running) {
            return;
        }


        const timer = setInterval(() => {

            setSeconds(prev => {

                if (prev <= 1) {

                    clearInterval(timer);

                    return 0;

                }


                return prev - 1;

            });

        }, 1000);


        return () => clearInterval(timer);

    }, [running]);



    /*
     * Send the SOS after the countdown
     * reaches zero.
     */
    useEffect(() => {

        if (
            running &&
            seconds === 0
        ) {

            setRunning(false);

            sendAlert();

        }

    }, [seconds, running]);



    const startTimer = () => {

        const value = Number(minutes);


        if (
            !value ||
            value <= 0 ||
            sending
        ) {
            return;
        }


        sent.current = false;

        setSeconds(
            Math.round(value * 60)
        );

        setRunning(true);

    };



    const cancelTimer = () => {

        setRunning(false);

        setSeconds(0);

        setMinutes("");

        setSending(false);

        sent.current = false;

    };



    return (

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center"
            }}
        >

            <h3
                style={{
                    color: "#fff",
                    marginBottom: "20px"
                }}
            >
                Countdown SOS
            </h3>



            <input
                type="number"
                min="1"
                placeholder="Enter minutes"
                value={minutes}
                disabled={
                    running || sending
                }
                onChange={(e) =>
                    setMinutes(
                        e.target.value
                    )
                }
                style={{
                    width: "80%",
                    padding: "12px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    border:
                        "1px solid #4f5c69",
                    background: "#1b2f42",
                    color: "#fff"
                }}
            />



            <h1
                style={{
                    color: "#fff",
                    margin: "15px 0"
                }}
            >
                {Math.floor(
                    seconds / 60
                )}
                :
                {String(
                    Math.floor(
                        seconds % 60
                    )
                ).padStart(2, "0")}
            </h1>



            {sending && (

                <p
                    style={{
                        color: "#fff",
                        marginBottom: "12px",
                        fontWeight: "600"
                    }}
                >
                    Sending SOS...
                </p>

            )}



            <div>

                <button
                    onClick={startTimer}
                    disabled={
                        running || sending
                    }
                    style={{
                        padding: "12px 24px",
                        borderRadius: "8px",
                        border: "none",
                        cursor:
                            running || sending
                                ? "not-allowed"
                                : "pointer",
                        opacity:
                            running || sending
                                ? 0.6
                                : 1
                    }}
                >
                    Start
                </button>



                <button
                    onClick={cancelTimer}
                    disabled={sending}
                    style={{
                        marginLeft: "12px",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        border: "none",
                        cursor:
                            sending
                                ? "not-allowed"
                                : "pointer",
                        opacity:
                            sending
                                ? 0.6
                                : 1
                    }}
                >
                    Cancel
                </button>

            </div>

        </div>

    );

}

