import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

// Pages
import Plants from "pages/Plants";
import JoinHome from "pages/JoinHome";
import CreateHome from "pages/CreateHome";
import Settings from "pages/Settings";
import Home from "pages/Home";
import Auth from "pages/Auth";
import Landing from "pages/Landing";

// Components
import Background from "components/Background";

export default function App() {
    return (
        <div className="app">
            <Background />

            <Router>
                <Switch>
                    {/* ################################# */}
                    {/*   PLANTS                          */}
                    {/* ################################# */}
                    <Route path="/plants" component={Plants} exact></Route>

                    {/* ################################# */}
                    {/*   JOIN HOME                       */}
                    {/* ################################# */}
                    <Route path="/joinHome" component={JoinHome} exact></Route>

                    {/* ################################# */}
                    {/*   CREATE HOME PAGE                */}
                    {/* ################################# */}
                    <Route path="/createHome" component={CreateHome} exact></Route>

                    {/* ################################# */}
                    {/*   SETTINGS                        */}
                    {/* ################################# */}
                    <Route path="/settings" component={Settings} exact></Route>

                    {/* ################################# */}
                    {/*   HOME PAGE                       */}
                    {/* ################################# */}
                    <Route path="/home" component={Home} exact></Route>

                    {/* ################################# */}
                    {/*   AUTH PAGE                       */}
                    {/* ################################# */}
                    <Route path="/auth" component={Auth} exact></Route>

                    {/* ################################# */}
                    {/*   LANDING PAGE                    */}
                    {/* ################################# */}
                    <Route path="/" component={Landing} exact></Route>
                </Switch>
            </Router>
        </div>
    );
}
