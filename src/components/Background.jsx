import React, { useEffect, useRef } from "react";
import { animated, useSpring } from "react-spring";

// Constants
const GRADIENTS = {
    turquoise: ["#2192bf", "#02f8ab"],
    purple: ["#b758f4", "#2192bf"],
    orange: ["#f4a658", "#f46b6b"],
};

export default function Background() {
    // Print Render
    if (process.env.REACT_APP_DEBUGG === "true" && process.env.NODE_ENV !== "production") console.log("%cRender Background", "color: grey; font-size: 11px");

    // #################################################
    //   BACKGROUND LOGIC
    // #################################################

    // Current background
    const currGradient = useRef("turquoise");

    // Spring
    const [{ background }, setGradient] = useSpring(() => ({
        background: `linear-gradient(60deg, ${GRADIENTS[currGradient.current][0]} 0%, ${GRADIENTS[currGradient.current][1]} 100%)`,
        config: { friction: 40 },
    }));

    // Set te background gradient by one of its presets
    const onGradientChange = ({ gradientName }) => {
        if (!(gradientName in GRADIENTS)) return;

        // Set the background gradient
        setGradient({ background: `linear-gradient(60deg, ${GRADIENTS[gradientName][0]} 0%, ${GRADIENTS[gradientName][1]} 100%)` });
        currGradient.current = gradientName;
    };

    // #################################################
    //   COMPONENT MOUNT
    // #################################################

    // On componente mount
    useEffect(() => {
        // Subscribe to a gradient change
        window.PubSub.sub("onGradientChange", onGradientChange);

        // Unsubscribe on unmount
        return () => {};

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // #################################################
    //   RENDER
    // #################################################

    return <animated.div className="background" style={{ backgroundImage: background }} />;
}
