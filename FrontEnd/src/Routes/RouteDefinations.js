import React from "react";
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import LoginForm from "../Components/loginPage";
import SignupForm from '../Components/registraionPage';
import ChatMain from "../Components/chatMain";
const RouteDefinations = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* <Route path="/" element={<Beforeloginlayout><Home /></Beforeloginlayout>} /> */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/" element={<SignupForm />} />
                <Route path='/chatMain' element={<ChatMain />}></Route>
            </Routes>
        </BrowserRouter>
    )
}
export default RouteDefinations;