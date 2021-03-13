import React, { createContext, useRef, useState } from "react";

// Data Context
export const Data = createContext();

const DataProvider = (props) => {
    // LANDING CHECK
    const landingDone = useRef(false);

    // USER
    const token = useRef(null);
    const username = useRef(null);
    const userID = useRef(null);
    const image = useRef(null);
    const settings = useRef({ vibrate: true });

    // ROOM
    const [roomID, setRoomID] = useState(null);

    return (
        <Data.Provider
            value={{
                // LANDING CHECK
                landingDone,

                // USER
                token,
                username,
                userID,
                image,
                settings,

                // ROOM
                roomID,
                setRoomID,
            }}
        >
            {props.children}
        </Data.Provider>
    );
};

export default DataProvider;
