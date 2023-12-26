import React from "react";
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import LoginForm from "../Components/loginPage";
import SignupForm from '../Components/registraionPage';
import ChatMain from "../Components/chatMain";
import { SocketProvider } from "../Providers/Socket";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RouteDefinations = () => {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        return token ? true : false;
    };

    return (
        <SocketProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/register"
                        element={isAuthenticated() ? <Navigate to="/chatMain" /> : <><ToastContainer /><SignupForm /></>}
                    />
                    <Route
                        path="/"
                        element={isAuthenticated() ? <Navigate to="/chatMain" /> : <><ToastContainer /><LoginForm /></>}
                    />
                    <Route
                        path="/chatMain"
                        element={isAuthenticated() ? <><ToastContainer /><ChatMain /></> : <Navigate to="/" />}
                    />
                    <Route
                        path="/*"
                        element={<Navigate to="/" />}
                    />
                </Routes>
            </BrowserRouter>
        </SocketProvider>
    )
}

export default RouteDefinations;
