import React from "react";

export default function Glass({ children, style, onClick, classes }) {
    // Print Render
    if (process.env.REACT_APP_DEBUGG === "true" && process.env.NODE_ENV !== "production") console.log("%cRender Glass", "color: grey; font-size: 11px");

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={`glass ${classes}`} style={style} onClick={onClick}>
            {children}
        </div>
    );
}
