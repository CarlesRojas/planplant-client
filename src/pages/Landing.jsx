import React, { useContext } from "react";
import { Redirect } from "react-router-dom";

// Contexts
import { API } from "contexts/API";
import { Data } from "contexts/Data";

export default function Landing() {
    // Print Render
    if (process.env.REACT_APP_DEBUGG === "true" && process.env.NODE_ENV !== "production") console.log("%cRender Landing", "color: grey; font-size: 11px");

    // Contexts
    const { isLoggedIn } = useContext(API);
    const { landingDone } = useContext(Data);

    // #################################################
    //   RENDER
    // #################################################

    // Landing Complete
    landingDone.current = true;

    // Already logged in -> Go Home
    if (isLoggedIn()) return <Redirect to={"/home"} push={true} />;

    // Not logged in -> Go to Auth
    return <Redirect to={"/auth"} push={true} />;
}
