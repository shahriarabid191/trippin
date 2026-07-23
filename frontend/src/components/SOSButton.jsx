import { useState } from "react";
import { triggerSosAlert } from "../api/sosAlertAPI";


export default function SOSButton() {

    const [tap, setTap] = useState(0);


    const handleTap = () => {

        const count = tap + 1;

        setTap(count);


        if (count === 3) {

            navigator.geolocation.getCurrentPosition(
                async (position) => {

                    try {

                        const response = await triggerSosAlert({
                            lat: position.coords.latitude,
                            long: position.coords.longitude,
                            type: "INSTANT"
                        });


                        if (response.error) {
                            alert(response.error);
                            return;
                        }


                        alert("SOS SENT");


                    } catch (error) {

                        alert("No SOS contacts available");

                    }

                }
            );


            setTap(0);
        }

    };


    return (
        <button
            onClick={handleTap}
            style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "red",
                color: "white",
                fontSize: "25px",
                border: "2px solid #fff",
                cursor: "pointer"
            }}
        >
            SOS
        </button>
    );
}