const API = "http://localhost:5050/api/sos-alerts";


export const triggerSosAlert = async(data)=>{

    const res = await fetch(API,{
        method:"POST",
        credentials:"include",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    });

    return res.json();
};



export const getReceivedAlerts = async()=>{

    const res = await fetch(
        `${API}/received`,
        {
            credentials:"include"
        }
    );

    return res.json();
};



export const acknowledgeAlert = async(id)=>{

    const res = await fetch(
        `${API}/${id}/ack`,
        {
            method:"PUT",
            credentials:"include"
        }
    );

    return res.json();
};