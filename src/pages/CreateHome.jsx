import React, { useEffect, useContext, useState, useRef } from "react";
import { Redirect } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import Webcam from "react-webcam";
import SVG from "react-inlinesvg";
import classnames from "classnames";
import gsap from "gsap";

// Components
import Glass from "components/Glass";

// Icons
import HomeIcon from "resources/icons/home.svg";
import LogoIcon from "resources/logoWhite.svg";
import BackIcon from "resources/icons/arrow.svg";
import PasswordIcon from "resources/icons/password.svg";
import CameraIcon from "resources/icons/cam.svg";
import ReverseIcon from "resources/icons/reverse.svg";
import FolderIcon from "resources/icons/folder.svg";

// Contexts
import { Utils } from "contexts/Utils";
import { Data } from "contexts/Data";
import { API } from "contexts/API";

// Constants
const SCREEN_WIDTH = window.innerWidth;

export default function CreateHome() {
    // Print Render
    if (process.env.REACT_APP_DEBUGG === "true" && process.env.NODE_ENV !== "production") console.log("%cRender Create Home", "color: grey; font-size: 11px");

    // Contexts
    const { vibrate, cropAndResizeImage } = useContext(Utils);
    const { landingDone, settings } = useContext(Data);
    const { createHome, joinHome } = useContext(API);

    // Redirect state
    const [redirectTo, setRedirectTo] = useState(null);

    // Go to landing if not done already
    if (!redirectTo && !landingDone.current) setRedirectTo("/");

    // #################################################
    //   FORMS
    // #################################################

    // Loading icon ref
    const loadingSectionRef = useRef(null);

    // Form states
    const [createHomeForm, setCreateHomeForm] = useState({ homeName: "", password: "", image: "" });
    const [createHomeError, setCreateHomeError] = useState(null);
    const [camError, setCamError] = useState(null);

    // When the create home form changes
    const onCreateHomeFormChange = (event) => {
        const { name, value } = event.target;
        setCreateHomeForm((prevState) => ({ ...prevState, [name]: value }));
    };

    // When the users tries to create the Home
    const onCreateHome = async (event) => {
        event.preventDefault();

        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        // Show loading screen
        showLoadingScreen();

        // Login
        const createHomeResult = await createHome(createHomeForm.homeName, createHomeForm.password, createHomeForm.image);

        // Throw error
        if ("error" in createHomeResult) {
            setCreateHomeError(createHomeResult.error);
            showCreateHomeScreen(false);
        } else {
            // Login
            const joinHomeResult = await joinHome(createHomeForm.homeName, createHomeForm.password);

            if ("error" in joinHomeResult) {
                setCreateHomeError(joinHomeResult.error);
                showCreateHomeScreen(false);
            } else {
                setRedirectTo("/plants");
            }
        }
    };

    // #################################################
    //   PAGE NAVIGATION
    // #################################################

    // Current page: "createHome" "loading" "camera"
    const currPageRef = useRef("createHome");
    const [, setCurrPage] = useState("createHome");

    // Page position spring
    const [pagePositions, setPagePositions] = useSpring(() => ({
        createHomeX: 0,
        loadingX: SCREEN_WIDTH,
        cameraX: SCREEN_WIDTH,
    }));

    // Show the create home screen
    const showCreateHomeScreen = (first) => {
        // Fade in if it is the first time
        if (first) {
            resetForms();
            const timeline = gsap.timeline({ defaults: { ease: "power1" } });
            timeline.fromTo(".createHome > .section > .glass", { opacity: 0 }, { opacity: 1, duration: 0.2 }, "+=0.25");
        } else {
            // Vibrate
            if (settings.current.vibrate) vibrate(25);
        }

        setPagePositions({ createHomeX: 0, loadingX: SCREEN_WIDTH, cameraX: SCREEN_WIDTH });
        currPageRef.current = "createHome";
        setCurrPage("createHome");
    };

    // Show the signup screen
    const showLoadingScreen = () => {
        // Reactivate the laoding icon animation
        loadingSectionRef.current.classList.remove("loadingSectionAnim");
        void loadingSectionRef.current.offsetWidth;
        loadingSectionRef.current.classList.add("loadingSectionAnim");

        setPagePositions({ createHomeX: -SCREEN_WIDTH, loadingX: 0, cameraX: SCREEN_WIDTH });

        currPageRef.current = "loading";
        setCurrPage("loading");
    };

    // Show the camera screen
    const showCameraScreen = () => {
        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        setPagePositions({ createHomeX: -SCREEN_WIDTH, loadingX: SCREEN_WIDTH, cameraX: 0 });
        currPageRef.current = "camera";
        setCurrPage("camera");
    };

    // Reset all form fields and errors
    const resetForms = () => {
        setCreateHomeError(null);
        setCreateHomeForm({ homeName: "", password: "", image: "" });
    };

    // #################################################
    //   WEBCAM
    // #################################################

    // Webcam reference
    const cameraRef = React.useRef(null);

    // Facing mode: "user" or "environment"
    const [facingMode, setFacingMode] = useState("user");
    const [numCameras, setNumCameras] = useState(2);

    // Capture a screenshot and save it in the register form state
    const capturePhoto = () => {
        const imageSrc = cameraRef.current.getScreenshot({ width: 400, height: 400 });

        setCreateHomeForm((prevState) => ({ ...prevState, image: imageSrc }));
        showCreateHomeScreen(false);
    };

    // Reverse camera
    const reverseCamera = () => {
        setFacingMode((prevState) => (prevState === "user" ? "environment" : "user"));
    };

    // #################################################
    //   BACK GESTURE
    // #################################################

    // Horizontal gesture
    const gestureBind = useDrag(
        ({ event, cancel, canceled, down, vxvy: [vx], movement: [mx] }) => {
            // Stop event propagation
            event.stopPropagation();

            // Return if canceled
            if (canceled) return;

            // Cancel gesture
            if (currPageRef.current !== "camera") {
                cancel();
                return;
            }

            // Snap to the welcome screen or stay on te current page
            if (!down) {
                if (mx > 100 || vx > 1) showCreateHomeScreen(false);
                else showCameraScreen();
            }

            // Update the position while the gesture is active
            else {
                var displ = Math.max(mx, -20);
                setPagePositions({ createHomeX: -SCREEN_WIDTH + displ, loadingX: SCREEN_WIDTH, cameraX: displ });
            }
        },
        { filterTaps: true, axis: "x" }
    );

    // #################################################
    //   IMAGE FILE
    // #################################################

    // Image input ref
    const imageInputRef = useRef(null);

    // Validate that the file is an image
    const validateFileType = async (event) => {
        // Return if there is no file
        if (!event.target.files || !event.target.files[0]) return;

        // Get file type
        var fileName = imageInputRef.current.value;
        var extension = fileName.substr(fileName.lastIndexOf(".") + 1, fileName.length).toLowerCase();

        // Crop and resize
        if (extension === "png" || extension === "jpg" || extension === "jpeg") {
            try {
                var croppedImage = await cropAndResizeImage(URL.createObjectURL(event.target.files[0]), 1, 400);
                setCreateHomeForm((prevState) => ({ ...prevState, image: croppedImage }));
                showCreateHomeScreen(false);
            } catch (error) {
                setCamError("Unable to load image");
            }
        }

        // Set error
        else setCamError("Wrong file type");
    };

    // Get image file from the system files
    const searchImageFile = () => {
        imageInputRef.current.click();
    };

    // #################################################
    //   COMPONENT MOUNT
    // #################################################

    // On componente mount
    useEffect(() => {
        if (landingDone.current) {
            // Get number of cameras
            const getNumCams = async () => {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(({ kind, label }) => kind === "videoinput" && !label.includes("OBS"));
                setNumCameras(cameras.length);
            };
            getNumCams();

            // Go to welcome page
            showCreateHomeScreen(true);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // #################################################
    //   RENDER
    // #################################################

    // Redirect to new route
    if (redirectTo) return <Redirect to={redirectTo} push={true} />;

    // Placeholder image if necessary
    var profileImage = createHomeForm.image ? (
        <img src={createHomeForm.image} alt="img" className="profileImage" onClick={showCameraScreen} />
    ) : (
        <div className="placeholderContainer" onClick={showCameraScreen}>
            <SVG className="profileImagePlaceholder" src={CameraIcon} />
        </div>
    );

    // Placeholder camera
    var webcam =
        currPageRef.current === "camera" ? (
            <Webcam
                className="webcam"
                audio={false}
                videoConstraints={{ facingMode: facingMode, aspectRatio: 1 }}
                mirrored={facingMode === "user"}
                ref={cameraRef}
                screenshotFormat="image/png"
            />
        ) : null;

    return (
        <div className="createHome">
            <animated.div className="section createHome" style={{ x: pagePositions.createHomeX }} {...gestureBind()}>
                <Glass style={{ minHeight: "67%" }}>
                    <SVG className="backButton" src={BackIcon} onClick={() => setRedirectTo("/home")} />

                    {profileImage}

                    <form autoComplete="off" noValidate spellCheck="false" onSubmit={onCreateHome}>
                        <div className="inputContainer">
                            <SVG className="inputIcon" src={HomeIcon} />
                            <input
                                className="input"
                                type="text"
                                placeholder=" home name"
                                name="homeName"
                                value={createHomeForm.homeName}
                                onChange={onCreateHomeFormChange}
                                autoComplete="new-password"
                            ></input>
                        </div>

                        <div className="inputContainer">
                            <SVG className="inputIcon" src={PasswordIcon} />
                            <input
                                className="input"
                                type="password"
                                placeholder=" home password"
                                name="password"
                                value={createHomeForm.password}
                                onChange={onCreateHomeFormChange}
                                autoComplete="new-password"
                            ></input>
                        </div>

                        <button type="submit" className="button closer">
                            Create Home
                        </button>

                        <div className="error">{createHomeError}</div>
                    </form>
                </Glass>
            </animated.div>

            <animated.div className="section cam" style={{ x: pagePositions.cameraX }} {...gestureBind()}>
                <Glass style={{ minHeight: "67%" }}>
                    <SVG className="backButton" src={BackIcon} onClick={() => showCreateHomeScreen(false)} />

                    {webcam}

                    <div className="camControls">
                        <SVG className={classnames("camControlIcon", { disabled: numCameras < 2 })} src={ReverseIcon} onClick={reverseCamera} />

                        <div className={classnames("camButton", { disabled: numCameras < 1 })}>
                            <SVG className="camIcon" src={CameraIcon} onClick={capturePhoto} />
                        </div>

                        <SVG className="camControlIcon" src={FolderIcon} onClick={searchImageFile} />
                        <input name="image" type="file" className="inputImage" accept=".jpg,.jpeg,.png" onChange={validateFileType} ref={imageInputRef} />
                    </div>

                    <div className="error">{camError}</div>
                </Glass>
            </animated.div>

            <animated.div className="section loading" style={{ x: pagePositions.loadingX }} ref={loadingSectionRef}>
                <SVG className="loadingIcon" src={LogoIcon} />
            </animated.div>
        </div>
    );
}
