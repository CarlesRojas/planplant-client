import React, { useEffect } from "react";
import SVG from "react-inlinesvg";
import gsap from "gsap";
import classnames from "classnames";

// Icons
import UserIcon from "resources/icons/user.svg";

export default function Profile({ image, text, size, clickable }) {
    // Print Render
    if (process.env.REACT_APP_DEBUGG === "true" && process.env.NODE_ENV !== "production") console.log("%cRender Profile", "color: grey; font-size: 11px");

    // #################################################
    //   COMPONENT MOUNT
    // #################################################

    // On componente mount
    useEffect(() => {
        const timeline = gsap.timeline({ defaults: { ease: "power1" } });
        timeline.fromTo(".profile ", { opacity: 0 }, { opacity: 1, duration: 0.2 }, "+=0.25");

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // #################################################
    //   RENDER
    // #################################################

    // Placeholder image if necessary
    if (image) var profileImage = <img src={image} alt="img" className={classnames("image", { clickable })} />;
    else
        profileImage = (
            <div className="container">
                <SVG className="placeholder" src={UserIcon} />
            </div>
        );

    // Profile style
    const profileStyle = {
        fontSize: size,
    };

    return (
        <div className="profile" style={profileStyle}>
            {profileImage}
            <p className="name">{text}</p>
        </div>
    );
}
