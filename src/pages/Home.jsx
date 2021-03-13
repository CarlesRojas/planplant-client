import React, { useEffect, useState, useContext } from "react";
import { Redirect } from "react-router-dom";

// Components
import Navbar from "components/Navbar";

// Contexts
import { Data } from "contexts/Data";

export default function Home() {
    // Print Render
    if (process.env.REACT_APP_DEBUGG === "true" && process.env.NODE_ENV !== "production") console.log("%cRender Home", "color: grey; font-size: 11px");

    // Contexts
    const { landingDone } = useContext(Data);

    // Redirect state
    const [redirectTo, setRedirectTo] = useState(null);

    // Go to landing if not done already
    if (!redirectTo && !landingDone.current) setRedirectTo("/");

    // #################################################
    //   COMPONENT MOUNT
    // #################################################

    // On componente mount
    useEffect(() => {
        // Change Background Color
        window.PubSub.emit("onGradientChange", { gradientName: "turquoise" });
        return () => {};

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // #################################################
    //   RENDER
    // #################################################

    // Redirect to new route
    if (redirectTo) return <Redirect to={redirectTo} push={true} />;

    return (
        <div className="home">
            <Navbar showSettings></Navbar>

            <div className="container"></div>
        </div>
    );
}
