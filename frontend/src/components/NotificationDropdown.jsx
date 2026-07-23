import { useEffect, useState } from "react";
import {
    getReceivedAlerts,
    acknowledgeAlert
} from "../api/sosAlertAPI";


export default function NotificationDropdown({ refreshCount }) {

    const [alerts, setAlerts] = useState([]);


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



    return (

        <div
            style={{
                position: "absolute",
                top: "45px",
                right: "0",
                width: "320px",
                background: "white",
                color: "black",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                padding: "15px",
                zIndex: 1000
            }}
        >

            <h3>
                Notifications
            </h3>


            {
                alerts.length === 0 ? (

                    <p>
                        No new notifications
                    </p>

                ) : (

                    alerts.map(alert => (

                        <div
                            key={alert.id}
                            style={{
                                borderBottom: "1px solid #ddd",
                                padding: "10px 0"
                            }}
                        >

                            <strong>
                                🚨 SOS Alert
                            </strong>


                            <p>
                                <strong>
                                    {alert.sender_username}
                                </strong>
                                {" "}needs help
                            </p>


                            {
                                alert.lat &&
                                alert.long &&

                                <p>
                                    Location:
                                    <br />
                                    {alert.lat},
                                    {alert.long}
                                </p>
                            }


                            <button
                                onClick={() =>
                                    ackTheSOS(alert.id)
                                }
                            >
                                Acknowledge
                            </button>


                        </div>

                    ))

                )
            }

        </div>

    );

}