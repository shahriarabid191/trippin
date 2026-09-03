import { useState } from "react";
import { triggerSosAlert } from "../api/sosAlertAPI";


export default function SOSButton() {

    const [tap, setTap] = useState(0);
    const [sending, setSending] = useState(false);


    const handleTap = () => {

        if (sending) {
            return;
        }


        const count = tap + 1;

        setTap(count);


        if (count === 3) {

            // Give immediate feedback
            setSending(true);

            // Reset tap counter immediately
            setTap(0);


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

                                type: "INSTANT"

                            });


                        if (response.error) {

                            alert(
                                response.error
                            );

                            return;

                        }


                        alert(
                            "SOS SENT"
                        );


                    } catch (error) {

                        alert(
                            error.message ||
                            "Failed to send SOS"
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

        }

    };


    return (

        <button
            onClick={handleTap}
            disabled={sending}
            style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "red",
                color: "white",
                fontSize: "25px",
                border: "2px solid #fff",
                cursor: sending
                    ? "not-allowed"
                    : "pointer",
                opacity: sending
                    ? 0.7
                    : 1
            }}
        >
            {sending ? "..." : "SOS"}
        </button>

    );

}