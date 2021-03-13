import React, { useState, useContext } from "react";
import { Redirect } from "react-router-dom";
import SVG from "react-inlinesvg";

// Contexts
import { Utils } from "contexts/Utils";
import { Data } from "contexts/Data";

// Icons
import LogoIcon from "resources/logoWhite.svg";
import BackIcon from "resources/icons/arrow.svg";
import SettingsIcon from "resources/icons/settings.svg";

export default function Navbar({ prevPage, onBackButtonClicked, style, showSettings = false }) {
    // Print Render
    if (process.env.REACT_APP_DEBUGG === "true" && process.env.NODE_ENV !== "production") console.log("%cRender Navbar", "color: grey; font-size: 11px");

    // Contexts
    const { vibrate } = useContext(Utils);
    const { settings } = useContext(Data);

    // Redirect state
    const [redirectTo, setRedirectTo] = useState(null);

    // #################################################
    //   SETTINGS BUTTON ACTION
    // #################################################

    // Called when the settings button is clicked
    const onSettingsButtonClicked = () => {
        if (!showSettings) return;

        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        // Redirect to settings
        setRedirectTo("/settings");
    };

    // #################################################
    //   RENDER
    // #################################################

    // Redirect to new route
    if (redirectTo) return <Redirect to={redirectTo} push={true} />;

    // Back button if necessary
    var backButton = onBackButtonClicked ? (
        <SVG
            className="backButton"
            src={BackIcon}
            onClick={() => {
                onBackButtonClicked();
                if (prevPage) setRedirectTo(prevPage);
            }}
        />
    ) : null;

    var settingsButton = showSettings ? <SVG className="settingsButton" src={SettingsIcon} onClick={onSettingsButtonClicked} /> : null;

    return (
        <div className="navbar" style={style}>
            {backButton}
            <SVG className="navbarLogo" src={LogoIcon} />
            {settingsButton}
        </div>
    );
}
