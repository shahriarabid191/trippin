import { useState, useEffect, useRef } from "react";
import { triggerSosAlert } from "../api/sosAlertAPI";


export default function CountdownSOS() {

    const [minutes, setMinutes] = useState("");
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);

    const sent = useRef(false);



    const sendAlert = () => {

        if (sent.current)
            return;

        sent.current = true;


        navigator.geolocation.getCurrentPosition(
            async (position) => {

                try {

                    const response = await triggerSosAlert({

                        lat: position.coords.latitude,
                        long: position.coords.longitude,
                        type: "COUNTDOWN"

                    });


                    if (response.error) {

                        alert(response.error);
                        return;

                    }


                    alert("Countdown SOS sent");


                } catch (error) {

                    alert("No SOS contacts available");

                }

            }
        );

    };




    useEffect(() => {

        if (!running)
            return;


        const timer = setInterval(() => {

            setSeconds(prev => {

                if (prev <= 1) {

                    sendAlert();

                    setRunning(false);

                    return 0;

                }


                return prev - 1;

            });


        }, 1000);



        return () => clearInterval(timer);


    }, [running]);





    const startTimer = () => {

        if (!minutes)
            return;


        sent.current = false;

        setSeconds(Math.round(Number(minutes) * 60));


        setRunning(true);

    };





    const cancelTimer = () => {

        setRunning(false);

        setSeconds(0);

        setMinutes("");

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
                placeholder="Enter minutes"
                value={minutes}
                disabled={running}
                onChange={(e) => setMinutes(e.target.value)}
                style={{
                    width: "80%",
                    padding: "12px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    border: "1px solid #4f5c69",
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
                {Math.floor(seconds / 60)}:
                {String(Math.floor(seconds % 60)).padStart(2, "0")}
            </h1>



            <div>

                <button
                    onClick={startTimer}
                    disabled={running}
                    style={{
                        padding: "12px 24px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    Start
                </button>



                <button
                    onClick={cancelTimer}
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


        </div>
    );
}