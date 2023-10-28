import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
    const [phoneNo, setPhoneNo] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/user/verify-login`, { phoneNo, password });
            if (response.data.message === 'success') {
                alert('Login Successful!');
                localStorage.setItem('token', response.data.token);
                window.location = `/chatMain`;
            }
        } catch (error) {
            if (error.response.data) {
                if (error.response.data.message === 'Failed') {
                    alert('Invalid Credentials');
                } else if (error.response.data.message === 'NotExist') {
                    alert('User not exist please Sign up first!');
                } else {
                    alert('Internal Server Error!');
                }
            }
            console.error(error);
            alert(error)
        }
    };

    return (
        <div className="main">
            <section className="sign-in">
                <div className="container">
                    <div className="signin-content">
                        <div className="signin-image">
                            <figure>
                                <img src="signin-image.jpg" alt="login image" />
                            </figure>
                            <a href="/" className="signup-image-link">
                                Create an account
                            </a>
                        </div>
                        <div className="signin-form">
                            <h2 className="form-title">Log In</h2>
                            <form className="register-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="pno">
                                        <i className="zmdi zmdi-account material-icons-name"></i>
                                    </label>
                                    <input
                                        type="text"
                                        name="pno"
                                        id="pno"
                                        placeholder="Your Phone No"
                                        value={phoneNo}
                                        onChange={(e) => setPhoneNo(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="your_pass">
                                        <i className="zmdi zmdi-lock"></i>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="form-group form-button">
                                    <input type="submit" name="signin" id="signin" className="form-submit" value="Log in" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LoginForm;
