import React, { createContext, useContext } from "react";

// Contexts
import { Utils } from "contexts/Utils";
import { Data } from "contexts/Data";

// API Context
export const API = createContext();

// API version
const apiVersion = "api_v1";

const APIProvider = (props) => {
    // Contexts
    const { setCookie, getCookie, clearCookies, urltoFile } = useContext(Utils);
    const { token, userName, userID, image, settings, homeName } = useContext(Data);

    const apiURL = process.env.NODE_ENV === "production" ? "https://planplant.herokuapp.com/" : "http://localhost:3100/";

    // Create a new user
    const register = async (userName, email, password, image) => {
        // Fail if there is no image
        if (!image) return { error: "Profile picture missing." };

        // #################################################
        //   GET S3 URL WHERE WE CAN UPLOAD THE IMAGE
        // #################################################

        // Transform Base 64 to file
        const fileName = new Date().toISOString() + "_" + userName + ".png";
        var imageFile = await urltoFile(image, fileName);

        // Post data
        var postData = {
            fileName: fileName,
            fileType: "image/png",
        };

        try {
            // Fetch S3 url configuration
            var rawResponse = await fetch(`${apiURL}${apiVersion}/aws/getS3URL`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            var response = await rawResponse.json();
            var signedRequest = response.signedRequest;
            var url = response.url;
        } catch (error) {
            return { error: "Sign Up Error" };
        }

        // #################################################
        //   UPLOAD THE IMAGE
        // #################################################

        try {
            // Fetch S3 url configuration
            await fetch(signedRequest, {
                method: "put",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "image/png",
                    "Access-Control-Allow-Origin": "*",
                },
                body: imageFile,
            });
        } catch (error) {
            return { error: "Sign Up Error" };
        }

        // #################################################
        //   SIGN UP
        // #################################################

        // Post data
        postData = { userName, email, password, image: url };

        try {
            // Fetch
            rawResponse = await fetch(`${apiURL}${apiVersion}/user/register`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            response = await rawResponse.json();

            // Return response
            return response;
        } catch (error) {
            return { error: "Sign Up Error" };
        }
    };

    // Authenticate an existing user
    const login = async (email, password) => {
        // Post data
        var postData = {
            email,
            password,
        };

        try {
            // Fetch
            var rawResponse = await fetch(`${apiURL}${apiVersion}/user/login`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            const response = await rawResponse.json();

            // Return with error if it is the case
            if ("error" in response) return response;

            // Save the new data
            if ("token" in response) token.current = response.token;
            if ("userName" in response) userName.current = response.userName;
            if ("id" in response) userID.current = response.id;
            if ("image" in response) image.current = response.image;
            if ("settings" in response) settings.current = response.settings;
            if ("homeName" in response) homeName.current = response.homeName ? response.homeName : null;

            // Set token cookie
            setCookie("planPlant_token", response.token, 365);
            setCookie("planPlant_name", response.userName, 365);
            setCookie("planPlant_id", response.id, 365);
            setCookie("planPlant_image", response.image, 365);
            setCookie("planPlant_settings", JSON.stringify(response.settings), 365);
            setCookie("planPlant_homeName", response.homeName ? response.homeName : "", 365);

            // Return response
            return response;
        } catch (error) {
            return { error: "Login Error" };
        }
    };

    // Log out the current user
    const logout = () => {
        token.current = null;
        userName.current = null;
        userID.current = null;
        image.current = null;
        settings.current = { vibrate: true };
        homeName.current = null;

        clearCookies();
    };

    // Check if there is a user logged in
    const isLoggedIn = () => {
        const tokenInCookie = getCookie("planPlant_token");
        const nameInCookie = getCookie("planPlant_name");
        const idInCookie = getCookie("planPlant_id");
        const imageInCookie = getCookie("planPlant_image");
        const settingsInCookieRaw = getCookie("planPlant_settings");
        const settingsInCookie = settingsInCookieRaw ? JSON.parse(settingsInCookieRaw) : settingsInCookieRaw;
        const homeNameInCookie = getCookie("planPlant_homeName");

        // If they exist, save in data and return true
        if (tokenInCookie && nameInCookie && idInCookie && imageInCookie && settingsInCookie) {
            token.current = tokenInCookie;
            userName.current = nameInCookie;
            userID.current = idInCookie;
            image.current = imageInCookie;
            settings.current = settingsInCookie;
            homeName.current = homeNameInCookie ? homeNameInCookie : null;

            // Renew expiration
            setCookie("planPlant_token", tokenInCookie, 365);
            setCookie("planPlant_name", nameInCookie, 365);
            setCookie("planPlant_id", idInCookie, 365);
            setCookie("planPlant_image", imageInCookie, 365);
            setCookie("planPlant_settings", JSON.stringify(settingsInCookie), 365);
            setCookie("planPlant_homeName", homeName.current ? homeName.current : "", 365);

            return true;
        }
        return false;
    };

    // Change the userName
    const changeUserName = async (password, newUserName) => {
        // Post data
        var postData = { userName: userName.current, password, newUserName };

        try {
            // Fetch
            var rawResponse = await fetch(`${apiURL}${apiVersion}/changeUserName`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            const response = await rawResponse.json();

            if ("success" in response) {
                // Save in the cookies and Data
                userName.current = newUserName;
                setCookie("planPlant_name", newUserName, 365);
            }

            // Return response
            return response;
        } catch (error) {
            return error;
        }
    };

    // Change the email
    const changeEmail = async (password, email) => {
        // Post data
        var postData = { userName: userName.current, password, email };

        try {
            // Fetch
            var rawResponse = await fetch(`${apiURL}${apiVersion}/changeEmail`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            const response = await rawResponse.json();

            // Return response
            return response;
        } catch (error) {
            return error;
        }
    };

    // Change the password
    const changePassword = async (password, newPassword) => {
        // Post data
        var postData = { userName: userName.current, password, newPassword };

        try {
            // Fetch
            var rawResponse = await fetch(`${apiURL}${apiVersion}/changePassword`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            const response = await rawResponse.json();

            // Return response
            return response;
        } catch (error) {
            return error;
        }
    };

    // Change the image
    const changeImage = async (password, newImage) => {
        // Fail if there is no image
        if (!newImage) return { error: "Profile picture missing." };

        // #################################################
        //   GET S3 URL WHERE WE CAN UPLOAD THE IMAGE
        // #################################################

        // Transform Base 64 to file
        const fileName = new Date().toISOString() + "_" + userName.current + ".png";
        var imageFile = await urltoFile(newImage, fileName);

        // Post data
        var postData = {
            fileName: fileName,
            fileType: "image/png",
        };

        try {
            // Fetch S3 url configuration
            var rawResponse = await fetch(`${apiURL}${apiVersion}/aws/getS3URL`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            var response = await rawResponse.json();
            var signedRequest = response.signedRequest;
            var url = response.url;
        } catch (error) {
            return { error: "Error saving image" };
        }

        // #################################################
        //   UPLOAD THE IMAGE
        // #################################################

        try {
            // Fetch S3 url configuration
            await fetch(signedRequest, {
                method: "put",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "image/png",
                    "Access-Control-Allow-Origin": "*",
                },
                body: imageFile,
            });
        } catch (error) {
            return { error: "Error saving image" };
        }

        // #################################################
        //   CHANGE IN DB
        // #################################################

        // Post data
        postData = { userName: userName.current, password, image: url };

        try {
            // Fetch
            rawResponse = await fetch(`${apiURL}${apiVersion}/changeImage`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            const response = await rawResponse.json();

            if ("success" in response) {
                // Save in the cookies and Data
                image.current = url;
                setCookie("planPlant_image", url, 365);
            }

            // Return response
            return response;
        } catch (error) {
            return error;
        }
    };

    // Change the settings
    const changeSettings = async (newSettings) => {
        // Post data
        var postData = { userName: userName.current, settings: newSettings };

        try {
            // Fetch
            var rawResponse = await fetch(`${apiURL}${apiVersion}/changeSettings`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            const response = await rawResponse.json();

            if ("success" in response) {
                // Save in the cookies and Data
                settings.current = newSettings;
                setCookie("planPlant_settings", JSON.stringify(newSettings), 365);
            }

            // Return response
            return response;
        } catch (error) {
            return error;
        }
    };

    // Delete account
    const deleteAccount = async (password) => {
        // Post data
        var postData = { userName: userName.current, password };

        try {
            // Fetch
            var rawResponse = await fetch(`${apiURL}${apiVersion}/deleteAccount`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            const response = await rawResponse.json();

            // Logout
            if ("success" in response) logout();

            // Return response
            return response;
        } catch (error) {
            return error;
        }
    };

    // Create home
    const createHome = async (newHomeName, password, image) => {
        // Fail if there is no image
        if (!image) return { error: "Home picture missing." };

        // #################################################
        //   GET S3 URL WHERE WE CAN UPLOAD THE IMAGE
        // #################################################

        // Transform Base 64 to file
        const fileName = new Date().toISOString() + "_home_" + newHomeName + ".png";
        var imageFile = await urltoFile(image, fileName);

        // Post data
        var postData = {
            fileName: fileName,
            fileType: "image/png",
        };

        try {
            // Fetch S3 url configuration
            var rawResponse = await fetch(`${apiURL}${apiVersion}/aws/getS3URL`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            var response = await rawResponse.json();
            var signedRequest = response.signedRequest;
            var url = response.url;
        } catch (error) {
            return { error: "Error creating Home" };
        }

        // #################################################
        //   UPLOAD THE IMAGE
        // #################################################

        try {
            // Fetch S3 url configuration
            await fetch(signedRequest, {
                method: "put",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "image/png",
                    "Access-Control-Allow-Origin": "*",
                },
                body: imageFile,
            });
        } catch (error) {
            return { error: "Error creating Home" };
        }

        // #################################################
        //   SIGN UP
        // #################################################

        // Post data
        postData = { homeName: newHomeName, password, image: url };

        try {
            // Fetch
            rawResponse = await fetch(`${apiURL}${apiVersion}/createHome`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            response = await rawResponse.json();

            // Return response
            return response;
        } catch (error) {
            return { error: "Error creating Home" };
        }
    };

    // Join Home
    const joinHome = async (newHomeName, password) => {
        // Post data
        var postData = { homeName: newHomeName, userName: userName.current, password };

        try {
            // Fetch
            var rawResponse = await fetch(`${apiURL}${apiVersion}/joinHome`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            const response = await rawResponse.json();

            if ("success" in response) {
                // Save in the cookies and Data
                homeName.current = newHomeName;
                setCookie("planPlant_homeName", newHomeName, 365);
            }

            // Return response
            return response;
        } catch (error) {
            return error;
        }
    };

    // Leave Home
    const leaveHome = async () => {
        // Post data
        var postData = { userName: userName.current };

        try {
            // Fetch
            var rawResponse = await fetch(`${apiURL}${apiVersion}/leaveHome`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            // Get data from response
            const response = await rawResponse.json();

            if ("success" in response) {
                // Save in the cookies and Data
                homeName.current = null;
                setCookie("planPlant_homeName", "", 365);
            }

            // Return response
            return response;
        } catch (error) {
            return error;
        }
    };

    // Return the context
    return (
        <API.Provider
            value={{
                apiURL,
                register,
                login,
                logout,
                isLoggedIn,
                changeUserName,
                changeEmail,
                changePassword,
                changeImage,
                changeSettings,
                deleteAccount,
                createHome,
                joinHome,
                leaveHome,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;
