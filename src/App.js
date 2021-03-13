import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

// Pages
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
