import React, { useEffect, useState, useContext } from "react";
import { Redirect } from "react-router-dom";
import SVG from "react-inlinesvg";
import gsap from "gsap";

// Components
import Navbar from "components/Navbar";
import Glass from "components/Glass";
import Profile from "components/Profile";

// Icons
import CreateIcon from "resources/icons/create.svg";
import JoinIcon from "resources/icons/join.svg";
// Contexts
import { Utils } from "contexts/Utils";
import { Data } from "contexts/Data";

export default function Home() {
    // Print Render
    if (process.env.REACT_APP_DEBUGG === "true" && process.env.NODE_ENV !== "production") console.log("%cRender Home", "color: grey; font-size: 11px");

    // Contexts
    const { vibrate } = useContext(Utils);
    const { userName, image, landingDone, settings, homeName } = useContext(Data);

    // Redirect state
    const [redirectTo, setRedirectTo] = useState(null);

    // Go to landing if not done already
    if (!redirectTo && !landingDone.current) setRedirectTo("/");

    // #################################################
    //   OPTION CLICKED
    // #################################################

    // When the users creates a home
    const onCreateHomeClicked = () => {
        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        // Redirect
        setRedirectTo("/createHome");
    };

    // When the user wants to join a home
    const onJoinHomeClicked = () => {
        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        // Redirect
        setRedirectTo("/joinHome");
    };

    // #################################################
    //   COMPONENT MOUNT
    // #################################################

    // On componente mount
    useEffect(() => {
        // Change Background Color
        window.PubSub.emit("onGradientChange", { gradientName: "turquoise" });

        // Animate
        if (landingDone.current && !homeName.current) {
            const timeline = gsap.timeline({ defaults: { ease: "power1" } });
            timeline.fromTo(".home > .container > .glass", { opacity: 0 }, { opacity: 1, duration: 0.2 }, "+=0.25");
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // #################################################
    //   RENDER
    // #################################################

    // Redirect to new route
    if (redirectTo) return <Redirect to={redirectTo} push={true} />;

    // If already in a home -> Go to Plants
    if (homeName.current) return <Redirect to={"/plants"} push={false} />;

    return (
        <div className="home">
            <Navbar showSettings></Navbar>

            <div className="container">
                <Profile image={image.current} text={`Hi, ${userName.current}!`} size={"2rem"} clickable={false}></Profile>

                <Glass style={{ minHeight: "20vh", margin: "7% 0 7% 0" }} onClick={onCreateHomeClicked} classes="clickable">
                    <SVG className="icon" src={CreateIcon} />
                    <p className="text">Create Home</p>
                </Glass>

                <Glass style={{ minHeight: "20vh" }} onClick={onJoinHomeClicked} classes="clickable">
                    <SVG className="icon" src={JoinIcon} />
                    <p className="text">Join Home</p>
                </Glass>
            </div>
        </div>
    );
}
