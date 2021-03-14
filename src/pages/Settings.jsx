import React, { useEffect, useContext, useState, useRef } from "react";

import { Redirect } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import Webcam from "react-webcam";
import SVG from "react-inlinesvg";
import classnames from "classnames";

// Components
import Navbar from "components/Navbar";
import Glass from "components/Glass";
import Setting from "components/Setting";

// Contexts
import { Utils } from "contexts/Utils";
import { Data } from "contexts/Data";
import { API } from "contexts/API";

// Icons
import SettingsIcon from "resources/icons/settings.svg";
import UserIcon from "resources/icons/user.svg";
import EmailIcon from "resources/icons/email.svg";
import PasswordIcon from "resources/icons/password.svg";
import DeleteIcon from "resources/icons/delete.svg";
import CameraIcon from "resources/icons/cam.svg";
import ReverseIcon from "resources/icons/reverse.svg";
import FolderIcon from "resources/icons/folder.svg";

// Constants
const SCREEN_WIDTH = window.innerWidth;

export default function Settings() {
    // Print Render
    if (process.env.REACT_APP_DEBUGG === "true" && process.env.NODE_ENV !== "production") console.log("%cRender Settings", "color: grey; font-size: 11px");

    // Contexts
    const { vibrate, cropAndResizeImage } = useContext(Utils);
    const { landingDone, settings } = useContext(Data);
    const { logout, changeUserName, changeEmail, changePassword, changeImage, changeSettings, deleteAccount } = useContext(API);

    // Redirect state
    const [redirectTo, setRedirectTo] = useState(null);

    // Go to landing if not done already
    if (!redirectTo && !landingDone.current) setRedirectTo("/");

    // #################################################
    //   FORMS
    // #################################################

    // Form states
    const [changeUserNameForm, setChangeUserNameForm] = useState({ userName: "", password: "" });
    const [changeEmailForm, setChangeEmailForm] = useState({ email: "", password: "" });
    const [changePasswordForm, setChangePasswordForm] = useState({ newPassword: "", password: "" });
    const [changeImageForm, setChangeImageForm] = useState({ image: "", password: "" });
    const [deleteAccountForm, setDeleteAccountForm] = useState({ password: "" });

    // Errors in forms
    const [changeUserNameError, setChangeUserNameError] = useState(null);
    const [changeEmailError, setChangeEmailError] = useState(null);
    const [changePasswordError, setChangePasswordError] = useState(null);
    const [changeImageError, setChangeImageError] = useState(null);
    const [deleteAccountError, setDeleteAccountError] = useState(null);
    const [camError, setCamError] = useState(null);

    // Success & Error messages
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // When the change userName form changes
    const onChangeUserNameFormChange = (event) => {
        const { name, value } = event.target;
        setChangeUserNameForm((prevState) => ({ ...prevState, [name]: value }));
    };

    // When the change email form changes
    const onChangeEmailFormChange = (event) => {
        const { name, value } = event.target;
        setChangeEmailForm((prevState) => ({ ...prevState, [name]: value }));
    };

    // When the change password form changes
    const onChangePasswordFormChange = (event) => {
        const { name, value } = event.target;
        setChangePasswordForm((prevState) => ({ ...prevState, [name]: value }));
    };

    // When the change image form changes
    const onChangeImageFormChange = (event) => {
        const { name, value } = event.target;
        setChangeImageForm((prevState) => ({ ...prevState, [name]: value }));
    };

    // When the delete account form changes
    const onDeleteAccountFormChange = (event) => {
        const { name, value } = event.target;
        setDeleteAccountForm((prevState) => ({ ...prevState, [name]: value }));
    };

    // When the users tries to change the userName
    const onChangeUserName = async (event) => {
        event.preventDefault();

        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        // Change UserName
        const result = await changeUserName(changeUserNameForm.password, changeUserNameForm.userName);

        // Throw error
        if ("error" in result) setChangeUserNameError(result.error);
        else {
            clearErrors();
            setSuccessMessage("User changed successfully");
            showMainScreen(true);
        }
    };

    // When the users tries to change the email
    const onChangeEmail = async (event) => {
        event.preventDefault();

        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        // Change email
        const result = await changeEmail(changeEmailForm.password, changeEmailForm.email);

        // Throw error
        if ("error" in result) setChangeEmailError(result.error);
        else {
            clearErrors();
            setSuccessMessage("Email changed successfully");
            showMainScreen(false);
        }
    };

    // When the users tries to change the password
    const onChangePassword = async (event) => {
        event.preventDefault();

        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        // Change password
        const result = await changePassword(changePasswordForm.password, changePasswordForm.newPassword);

        // Throw error
        if ("error" in result) setChangePasswordError(result.error);
        else {
            clearErrors();
            setSuccessMessage("Password changed successfully");
            showMainScreen(false);
        }
    };

    // When the users tries to change the image
    const onChangeImage = async (event) => {
        event.preventDefault();

        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        // Change password
        const result = await changeImage(changeImageForm.password, changeImageForm.image);

        // Throw error
        if ("error" in result) setChangeImageError(result.error);
        else {
            clearErrors();
            setSuccessMessage("Image changed successfully");
            showMainScreen(false);
        }
    };

    // When the users tries to delete the account
    const onDeleteAccount = async (event) => {
        event.preventDefault();

        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        // Change password
        const result = await deleteAccount(deleteAccountForm.password);

        // Throw error
        if ("error" in result) setDeleteAccountError(result.error);
        else {
            clearErrors();
            setSuccessMessage("Account Deleted successfully");
            logout();
            setRedirectTo("/");
        }
    };

    // When the user changes the vibration setting
    const onVibrateChange = async () => {
        // Change settings
        const result = await changeSettings(settings.current);

        // Throw error
        if ("error" in result) setErrorMessage(result.error);
        else {
            clearErrors();
            setSuccessMessage("Setting updated successfully");
        }
    };

    // On Log out
    const onLogout = () => {
        setRedirectTo("/");
        logout();
    };

    // #################################################
    //   PAGE NAVIGATION
    // #################################################

    // Current page: "main" "changeUserName" "changeEmail" "changePassword" "changeImage" "deleteAccount" "camera"
    const currPageRef = useRef("main");
    const [, setCurrPage] = useState("main");

    // Page position spring
    const [pagePositions, setPagePositions] = useSpring(() => ({
        mainX: 0,
        changeUserNameX: SCREEN_WIDTH,
        changeEmailX: SCREEN_WIDTH,
        changePasswordX: SCREEN_WIDTH,
        changeImageX: SCREEN_WIDTH,
        deleteAccountX: SCREEN_WIDTH,
        cameraX: SCREEN_WIDTH,
    }));

    // Show the main screen
    const showMainScreen = (first) => {
        // Vibrate
        if (!first && settings.current.vibrate) vibrate(25);

        resetForms();
        setPagePositions({
            mainX: 0,
            changeUserNameX: SCREEN_WIDTH,
            changeEmailX: SCREEN_WIDTH,
            changePasswordX: SCREEN_WIDTH,
            changeImageX: SCREEN_WIDTH,
            deleteAccountX: SCREEN_WIDTH,
            cameraX: SCREEN_WIDTH,
        });
        currPageRef.current = "main";
        setCurrPage("main");
    };

    // Show the change userName screen
    const showChangeUserNameScreen = (keepForm) => {
        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        if (!keepForm) resetForms();
        setSuccessMessage("");
        setPagePositions({
            mainX: -SCREEN_WIDTH,
            changeUserNameX: 0,
            changeEmailX: SCREEN_WIDTH,
            changePasswordX: SCREEN_WIDTH,
            changeImageX: SCREEN_WIDTH,
            deleteAccountX: SCREEN_WIDTH,
            cameraX: SCREEN_WIDTH,
        });
        currPageRef.current = "changeUserName";
        setCurrPage("changeUserName");
    };

    // Show the change email screen
    const showChangeEmailScreen = (keepForm) => {
        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        if (!keepForm) resetForms();
        setSuccessMessage("");
        setPagePositions({
            mainX: -SCREEN_WIDTH,
            changeUserNameX: SCREEN_WIDTH,
            changeEmailX: 0,
            changePasswordX: SCREEN_WIDTH,
            changeImageX: SCREEN_WIDTH,
            deleteAccountX: SCREEN_WIDTH,
            cameraX: SCREEN_WIDTH,
        });
        currPageRef.current = "changeEmail";
        setCurrPage("changeEmail");
    };

    // Show the change password screen
    const showChangePasswordScreen = (keepForm) => {
        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        if (!keepForm) resetForms();
        setSuccessMessage("");
        setPagePositions({
            mainX: -SCREEN_WIDTH,
            changeUserNameX: SCREEN_WIDTH,
            changeEmailX: SCREEN_WIDTH,
            changePasswordX: 0,
            changeImageX: SCREEN_WIDTH,
            deleteAccountX: SCREEN_WIDTH,
            cameraX: SCREEN_WIDTH,
        });
        currPageRef.current = "changePassword";
        setCurrPage("changePassword");
    };

    // Show the change image screen
    const showChangeImageScreen = (keepForm) => {
        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        if (!keepForm) resetForms();
        setSuccessMessage("");
        setPagePositions({
            mainX: -SCREEN_WIDTH,
            changeUserNameX: SCREEN_WIDTH,
            changeEmailX: SCREEN_WIDTH,
            changePasswordX: SCREEN_WIDTH,
            changeImageX: 0,
            deleteAccountX: SCREEN_WIDTH,
            cameraX: SCREEN_WIDTH,
        });
        currPageRef.current = "changeImage";
        setCurrPage("changeImage");
    };

    // Show the delete account screen
    const showDeleteAccountScreen = (keepForm) => {
        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        if (!keepForm) resetForms();
        setSuccessMessage("");
        setPagePositions({
            mainX: -SCREEN_WIDTH,
            changeUserNameX: SCREEN_WIDTH,
            changeEmailX: SCREEN_WIDTH,
            changePasswordX: SCREEN_WIDTH,
            changeImageX: SCREEN_WIDTH,
            deleteAccountX: 0,
            cameraX: SCREEN_WIDTH,
        });
        currPageRef.current = "deleteAccount";
        setCurrPage("deleteAccount");
    };

    // Show the camera screen
    const showCameraScreen = () => {
        // Vibrate
        if (settings.current.vibrate) vibrate(25);

        setPagePositions({
            mainX: -SCREEN_WIDTH,
            changeUserNameX: SCREEN_WIDTH,
            changeEmailX: SCREEN_WIDTH,
            changePasswordX: SCREEN_WIDTH,
            changeImageX: -SCREEN_WIDTH,
            deleteAccountX: SCREEN_WIDTH,
            cameraX: 0,
        });
        currPageRef.current = "camera";
        setCurrPage("camera");
    };

    // Reset all form fields
    const resetForms = () => {
        setChangeUserNameForm({ userName: "", password: "" });
        setChangeEmailForm({ email: "", password: "" });
        setChangePasswordForm({ newPassword: "", password: "" });
        setChangeImageForm({ image: "", password: "" });
        setDeleteAccountForm({ password: "" });
    };

    // Clear all errors
    const clearErrors = () => {
        setChangeUserNameError(null);
        setChangeEmailError(null);
        setChangePasswordError(null);
        setChangeImageError(null);
        setDeleteAccountError(null);
        setCamError(null);
        setErrorMessage(null);
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
            if (
                currPageRef.current !== "changeUserName" &&
                currPageRef.current !== "changeEmail" &&
                currPageRef.current !== "changePassword" &&
                currPageRef.current !== "changeImage" &&
                currPageRef.current !== "deleteAccount" &&
                currPageRef.current !== "camera"
            ) {
                cancel();
                return;
            }

            // Snap to the welcome screen or stay on the current page
            if (!down) {
                if (currPageRef.current === "camera" && (mx > 100 || vx > 1)) showChangeImageScreen(true);
                else if (mx > 100 || vx > 1) showMainScreen(false);
                else if (currPageRef.current === "changeUserName") showChangeUserNameScreen(true);
                else if (currPageRef.current === "changeEmail") showChangeEmailScreen(true);
                else if (currPageRef.current === "changePassword") showChangePasswordScreen(true);
                else if (currPageRef.current === "changeImage") showChangeImageScreen(true);
                else if (currPageRef.current === "deleteAccount") showDeleteAccountScreen(true);
                else if (currPageRef.current === "camera") showCameraScreen();
            }

            // Update the position while the gesture is active
            else {
                var displ = Math.max(mx, -20);
                if (currPageRef.current === "changeUserName")
                    setPagePositions({
                        mainX: -SCREEN_WIDTH + displ,
                        changeUserNameX: displ,
                        changeEmailX: SCREEN_WIDTH,
                        changePasswordX: SCREEN_WIDTH,
                        changeImageX: SCREEN_WIDTH,
                        deleteAccountX: SCREEN_WIDTH,
                        cameraX: SCREEN_WIDTH,
                    });
                else if (currPageRef.current === "changeEmail")
                    setPagePositions({
                        mainX: -SCREEN_WIDTH + displ,
                        changeUserNameX: SCREEN_WIDTH,
                        changeEmailX: displ,
                        changePasswordX: SCREEN_WIDTH,
                        changeImageX: SCREEN_WIDTH,
                        deleteAccountX: SCREEN_WIDTH,
                        cameraX: SCREEN_WIDTH,
                    });
                else if (currPageRef.current === "changePassword")
                    setPagePositions({
                        mainX: -SCREEN_WIDTH + displ,
                        changeUserNameX: SCREEN_WIDTH,
                        changeEmailX: SCREEN_WIDTH,
                        changePasswordX: displ,
                        changeImageX: SCREEN_WIDTH,
                        deleteAccountX: SCREEN_WIDTH,
                        cameraX: SCREEN_WIDTH,
                    });
                else if (currPageRef.current === "changeImage")
                    setPagePositions({
                        mainX: -SCREEN_WIDTH + displ,
                        changeUserNameX: SCREEN_WIDTH,
                        changeEmailX: SCREEN_WIDTH,
                        changePasswordX: SCREEN_WIDTH,
                        changeImageX: displ,
                        deleteAccountX: SCREEN_WIDTH,
                        cameraX: SCREEN_WIDTH,
                    });
                else if (currPageRef.current === "deleteAccount")
                    setPagePositions({
                        mainX: -SCREEN_WIDTH + displ,
                        changeUserNameX: SCREEN_WIDTH,
                        changeEmailX: SCREEN_WIDTH,
                        changePasswordX: SCREEN_WIDTH,
                        changeImageX: SCREEN_WIDTH,
                        deleteAccountX: displ,
                        cameraX: SCREEN_WIDTH,
                    });
                else if (currPageRef.current === "camera")
                    setPagePositions({
                        mainX: -SCREEN_WIDTH,
                        changeUserNameX: SCREEN_WIDTH,
                        changeEmailX: SCREEN_WIDTH,
                        changePasswordX: SCREEN_WIDTH,
                        changeImageX: -SCREEN_WIDTH + displ,
                        deleteAccountX: SCREEN_WIDTH,
                        cameraX: displ,
                    });
            }
        },
        { filterTaps: true, axis: "x" }
    );

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

        setChangeImageForm((prevState) => ({ ...prevState, image: imageSrc }));
        clearErrors();
        showChangeImageScreen(true);
    };

    // Reverse camera
    const reverseCamera = () => {
        setFacingMode((prevState) => (prevState === "user" ? "environment" : "user"));
    };

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
                setChangeImageForm((prevState) => ({ ...prevState, image: croppedImage }));
                clearErrors();
                showChangeImageScreen(true);
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

    const onBackButtonClicked = () => {
        if (currPageRef.current === "main") {
            // Vibrate
            if (settings.current.vibrate) vibrate(25);

            // Redirect to home
            setRedirectTo("/home");
        } else if (currPageRef.current === "camera") showChangeImageScreen(false);
        else showMainScreen(false);
    };

    // On componente mount
    useEffect(() => {
        // Change Background Color
        window.PubSub.emit("onGradientChange", { gradientName: "purple" });

        if (landingDone.current) {
            // Get number of cameras
            const getNumCams = async () => {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(({ kind, label }) => kind === "videoinput" && !label.includes("OBS"));
                setNumCameras(cameras.length);
            };
            getNumCams();

            resetForms();

            // Show main settings screen
            showMainScreen(true);
        }

        // Unsubscribe on unmount
        return () => {};

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // #################################################
    //   RENDER
    // #################################################

    // Redirect to new route
    if (redirectTo) return <Redirect to={redirectTo} push={true} />;

    // Placeholder image if necessary
    var profileImage = changeImageForm.image ? (
        <img src={changeImageForm.image} alt="img" className="profileImage" onClick={showCameraScreen} />
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

    // Success / Error message on main screen
    const message = successMessage ? <div className="success">{successMessage}</div> : <div className="error">{errorMessage}</div>;

    return (
        <div className="settings">
            <Navbar onBackButtonClicked={onBackButtonClicked}></Navbar>
            <div className="container">
                <animated.div className="section main" style={{ x: pagePositions.mainX }}>
                    <Glass style={{ minHeight: "67%", maxHeight: "calc(100% - 1rem)" }}>
                        <SVG className="settingsIcon" src={SettingsIcon} />

                        <div className="overflowContainer">
                            <div className="settingsContainer">
                                <div className="button lower closer red" onClick={onLogout} style={{ marginTop: "4%" }}>
                                    Log Out
                                </div>

                                <div className="button lower closer red" onClick={showDeleteAccountScreen}>
                                    Delete Account
                                </div>

                                <div className="button lower closer" onClick={showChangeUserNameScreen}>
                                    Change Name
                                </div>

                                <div className="button lower closer" onClick={showChangeEmailScreen}>
                                    Change Email
                                </div>

                                <div className="button lower closer" onClick={showChangePasswordScreen}>
                                    Change Password
                                </div>

                                <div className="button lower closer" onClick={showChangeImageScreen}>
                                    Change Image
                                </div>

                                <Setting name="Vibration" action={onVibrateChange} settingName={"vibrate"}></Setting>
                            </div>
                        </div>

                        {message}
                    </Glass>
                </animated.div>

                <animated.div className="section changeUserName" style={{ x: pagePositions.changeUserNameX }} {...gestureBind()}>
                    <Glass style={{ minHeight: "67%" }}>
                        <SVG className="logo small" src={UserIcon} />

                        <form autoComplete="off" noValidate spellCheck="false" onSubmit={onChangeUserName}>
                            <div className="inputContainer">
                                <SVG className="inputIcon" src={UserIcon} />
                                <input
                                    className="input"
                                    type="text"
                                    placeholder=" new name"
                                    name="userName"
                                    value={changeUserNameForm.userName}
                                    onChange={onChangeUserNameFormChange}
                                    autoComplete="new-password"
                                ></input>
                            </div>

                            <div className="inputContainer">
                                <SVG className="inputIcon" src={PasswordIcon} />
                                <input
                                    className="input"
                                    type="password"
                                    placeholder=" password"
                                    name="password"
                                    value={changeUserNameForm.password}
                                    onChange={onChangeUserNameFormChange}
                                    autoComplete="new-password"
                                ></input>
                            </div>

                            <button type="submit" className="button closer">
                                Change Name
                            </button>

                            <div className="error">{changeUserNameError}</div>
                        </form>
                    </Glass>
                </animated.div>

                <animated.div className="section changeEmail" style={{ x: pagePositions.changeEmailX }} {...gestureBind()}>
                    <Glass style={{ minHeight: "67%" }}>
                        <SVG className="logo small" src={EmailIcon} />

                        <form autoComplete="off" noValidate spellCheck="false" onSubmit={onChangeEmail}>
                            <div className="inputContainer">
                                <SVG className="inputIcon email" src={EmailIcon} />
                                <input
                                    className="input"
                                    type="email"
                                    placeholder=" new email"
                                    name="email"
                                    value={changeEmailForm.email}
                                    onChange={onChangeEmailFormChange}
                                    autoComplete="new-password"
                                ></input>
                            </div>

                            <div className="inputContainer">
                                <SVG className="inputIcon" src={PasswordIcon} />
                                <input
                                    className="input"
                                    type="password"
                                    placeholder=" password"
                                    name="password"
                                    value={changeEmailForm.password}
                                    onChange={onChangeEmailFormChange}
                                    autoComplete="new-password"
                                ></input>
                            </div>

                            <button type="submit" className="button closer">
                                Change Email
                            </button>
                            <div className="error">{changeEmailError}</div>
                        </form>
                    </Glass>
                </animated.div>

                <animated.div className="section changePassword" style={{ x: pagePositions.changePasswordX }} {...gestureBind()}>
                    <Glass style={{ minHeight: "67%" }}>
                        <SVG className="logo small" src={PasswordIcon} />

                        <form autoComplete="off" noValidate spellCheck="false" onSubmit={onChangePassword}>
                            <div className="inputContainer">
                                <SVG className="inputIcon" src={PasswordIcon} />
                                <input
                                    className="input"
                                    type="password"
                                    placeholder=" new password"
                                    name="newPassword"
                                    value={changePasswordForm.newPassword}
                                    onChange={onChangePasswordFormChange}
                                    autoComplete="new-password"
                                ></input>
                            </div>

                            <div className="inputContainer">
                                <SVG className="inputIcon" src={PasswordIcon} />
                                <input
                                    className="input"
                                    type="password"
                                    placeholder=" old password"
                                    name="password"
                                    value={changePasswordForm.password}
                                    onChange={onChangePasswordFormChange}
                                    autoComplete="new-password"
                                ></input>
                            </div>

                            <button type="submit" className="button closer">
                                Change Password
                            </button>

                            <div className="error">{changePasswordError}</div>
                        </form>
                    </Glass>
                </animated.div>

                <animated.div className="section changeImage" style={{ x: pagePositions.changeImageX }} {...gestureBind()}>
                    <Glass style={{ minHeight: "67%" }}>
                        {profileImage}

                        <form autoComplete="off" noValidate spellCheck="false" onSubmit={onChangeImage}>
                            <div className="inputContainer">
                                <SVG className="inputIcon" src={PasswordIcon} />
                                <input
                                    className="input"
                                    type="password"
                                    placeholder=" password"
                                    name="password"
                                    value={changeImageForm.password}
                                    onChange={onChangeImageFormChange}
                                    autoComplete="new-password"
                                ></input>
                            </div>

                            <button type="submit" className="button closer">
                                Change Image
                            </button>

                            <div className="error">{changeImageError}</div>
                        </form>
                    </Glass>
                </animated.div>

                <animated.div className="section deleteAccount" style={{ x: pagePositions.deleteAccountX }} {...gestureBind()}>
                    <Glass style={{ minHeight: "67%" }}>
                        <SVG className="logo small" src={DeleteIcon} />

                        <form autoComplete="off" noValidate spellCheck="false" onSubmit={onDeleteAccount}>
                            <div className="inputContainer">
                                <SVG className="inputIcon" src={PasswordIcon} />
                                <input
                                    className="input"
                                    type="password"
                                    placeholder=" password"
                                    name="password"
                                    value={deleteAccountForm.password}
                                    onChange={onDeleteAccountFormChange}
                                    autoComplete="new-password"
                                ></input>
                            </div>

                            <button type="submit" className="button closer">
                                Delete Account
                            </button>

                            <div className="error">{deleteAccountError}</div>
                        </form>
                    </Glass>
                </animated.div>

                <animated.div className="section camera" style={{ x: pagePositions.cameraX }} {...gestureBind()}>
                    <Glass style={{ minHeight: "67%" }}>
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
            </div>
        </div>
    );
}
