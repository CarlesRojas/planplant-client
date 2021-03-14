import React, { createContext, useRef, useState } from "react";

// Data Context
export const Data = createContext();

const DataProvider = (props) => {
    // LANDING CHECK
    const landingDone = useRef(false);

    // USER
    const token = useRef(null);
    const userName = useRef(null);
    const userID = useRef(null);
    const image = useRef(null);
    const settings = useRef({ vibrate: true });
    const homeName = useRef(null);

    // BACK BUTTON HANDLE
    const mostAdvancedRoute = useRef("home");

    // ROOM
    const [homeID, setHomeID] = useState(null);

    return (
        <Data.Provider
            value={{
                // LANDING CHECK
                landingDone,

                // USER
                token,
                userName,
                userID,
                image,
                settings,
                homeName,

                // BACK BUTTON HANDLE
                mostAdvancedRoute,

                // ROOM
                homeID,
                setHomeID,
            }}
        >
            {props.children}
        </Data.Provider>
    );
};

export default DataProvider;
