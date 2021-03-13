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
    const { token, username, userID, image, settings } = useContext(Data);

    const apiURL = process.env.NODE_ENV === "production" ? "https://planplant.herokuapp.com/" : "http://localhost:3100/";

    // Create a new user
    const register = async (username, email, password, image) => {
        // Fail if there is no image
        if (!image) return { error: "Profile picture missing." };

        // #################################################
        //   GET S3 URL WHERE WE CAN UPLOAD THE IMAGE
        // #################################################

        // Transform Base 64 to file
        const fileName = new Date().toISOString() + "_" + username + ".png";
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
        postData = { username, email, password, image: url };

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
            if ("username" in response) username.current = response.username;
            if ("id" in response) userID.current = response.id;
            if ("image" in response) image.current = response.image;
            if ("settings" in response) settings.current = response.settings;

            // Set token cookie
            setCookie("planPlant_token", response.token, 365);
            setCookie("planPlant_name", response.username, 365);
            setCookie("planPlant_id", response.id, 365);
            setCookie("planPlant_image", response.image, 365);
            setCookie("planPlant_settings", JSON.stringify(response.settings), 365);

            // Return response
            return response;
        } catch (error) {
            return { error: "Login Error" };
        }
    };

    // Log out the current user
    const logout = () => {
        token.current = null;
        username.current = null;
        userID.current = null;
        image.current = null;
        settings.current = { vibrate: true };

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

        // If they exist, save in data and return true
        if (tokenInCookie && nameInCookie && idInCookie && imageInCookie && settingsInCookie) {
            token.current = tokenInCookie;
            username.current = nameInCookie;
            userID.current = idInCookie;
            image.current = imageInCookie;
            settings.current = settingsInCookie;

            // Renew expiration
            setCookie("planPlant_token", tokenInCookie, 365);
            setCookie("planPlant_name", nameInCookie, 365);
            setCookie("planPlant_id", idInCookie, 365);
            setCookie("planPlant_image", imageInCookie, 365);
            setCookie("planPlant_settings", JSON.stringify(settingsInCookie), 365);

            return true;
        }
        return false;
    };

    // Change the username
    const changeUsername = async (password, newUsername) => {
        // Post data
        var postData = { username: username.current, password, newUsername };

        try {
            // Fetch
            var rawResponse = await fetch(`${apiURL}${apiVersion}/changeUsername`, {
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
                username.current = newUsername;
                setCookie("planPlant_name", newUsername, 365);
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
        var postData = { username: username.current, password, email };

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
        var postData = { username: username.current, password, newPassword };

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
        const fileName = new Date().toISOString() + "_" + username.current + ".png";
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
        postData = { username: username.current, password, image: url };

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
        var postData = { username: username.current, settings: newSettings };

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
        var postData = { username: username.current, password };

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

    // Return the context
    return (
        <API.Provider
            value={{
                apiURL,
                register,
                login,
                logout,
                isLoggedIn,
                changeUsername,
                changeEmail,
                changePassword,
                changeImage,
                changeSettings,
                deleteAccount,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;
