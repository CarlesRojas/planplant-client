import React, { useContext, useRef } from "react";
import { useSpring, animated } from "react-spring";
import { useDrag } from "react-use-gesture";

// Contexts
import { Utils } from "contexts/Utils";
import { Data } from "contexts/Data";

export default function Setting({ name, action, settingName }) {
    // Print Render
    if (process.env.REACT_APP_DEBUGG === "true" && process.env.NODE_ENV !== "production") console.log("%cRender Setting", "color: grey; font-size: 11px");

    // Contexts
    const { vibrate, clamp, invlerp } = useContext(Utils);
    const { settings } = useContext(Data);

    // Slider
    const sliderRef = useRef(null);

    // #################################################
    //   BACKGROUND GRADIENT
    // #################################################

    // Color position between 0 and 1
    const [{ colorPos }, setColorPos] = useSpring(() => ({ colorPos: !settings.current[settingName] ? 0 : 1 }));

    // #################################################
    //   ACTIONS
    // #################################################

    // Page position spring
    const [{ x }, setPosition] = useSpring(() => ({ x: !settings.current[settingName] ? "0%" : "25%" }));

    // Deactivate Setting
    const deactivateSetting = (execAction) => {
        // Change position and gradient
        setPosition({ x: "0%" });
        setColorPos({ colorPos: 0 });

        if (execAction && settings.current[settingName]) {
            settings.current[settingName] = false;

            // Vibrate
            if (settings.current.vibrate) vibrate(25);

            // Send the action with a value of false
            action(false);
        }
    };

    // Activate Setting
    const activateSetting = (execAction) => {
        // Change position and gradient
        setPosition({ x: "25%" });
        setColorPos({ colorPos: 1 });

        if (execAction && !settings.current[settingName]) {
            settings.current[settingName] = true;

            // Vibrate
            if (settings.current.vibrate) vibrate(25);

            // Send the action with a value of true
            action(true);
        }
    };

    // #################################################
    //   BACK GESTURE
    // #################################################

    // Horizontal gesture
    const gestureBind = useDrag(
        ({ event, down, vxvy: [vx], movement: [mx] }) => {
            // Stop event propagation
            event.stopPropagation();

            // Width of the slider
            var sliderWidth = sliderRef.current.offsetWidth;

            // Snap to the welcome screen or stay on the current page
            if (!down) {
                if (mx > sliderWidth * 0.125 || vx > 1) activateSetting(true);
                else if (mx < -sliderWidth * 0.125 || vx < -1) deactivateSetting(true);
                else if (settings.current[settingName]) activateSetting(false);
                else deactivateSetting(false);
            }

            // Update the position while the gesture is active
            else {
                // Get displacement
                if (mx > 0) var disp = clamp(mx, 0, sliderWidth * 0.25);
                else disp = sliderWidth * 0.25 - clamp(Math.abs(mx), 0, sliderWidth * 0.25);

                setColorPos({ colorPos: invlerp(0, sliderWidth * 0.25, disp) });
                setPosition({ x: `${(disp / sliderWidth) * 100}%` });
            }
        },
        { filterTaps: true, axis: "x" }
    );

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="setting">
            <animated.div className="backGradient" style={{ background: colorPos.to({ range: [0, 1], output: ["#ff3400b3", "#29be29b3"] }) }}>
                Back
            </animated.div>
            <animated.div
                className="slider"
                {...gestureBind()}
                style={{ x }}
                onClick={() => (settings.current[settingName] ? deactivateSetting(true) : activateSetting(true))}
                ref={sliderRef}
            >
                {name}
            </animated.div>
        </div>
    );
}
