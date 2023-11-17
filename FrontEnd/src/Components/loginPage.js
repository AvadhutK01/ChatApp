import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const styles = {
    divider: {
        content: '""',
        flex: 1,
        height: '1px',
        background: '#eee',
    },
    hCustom: {
        height: 'calc(100% - 73px)',
    },
    hCustomMobile: {
        height: '100%',
    },
};
const LoginForm = () => {
    const [phoneNo, setPhoneNo] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/user/verify-login`, { phoneNo, password });
            if (response.data.message === 'success') {
                toast.success("Login success", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                setTimeout(() => {
                    localStorage.setItem('token', response.data.token);
                    window.location = `/chatMain`;
                }, 2000)
            }
        } catch (error) {
            if (error.response.data) {
                if (error.response.data.message === 'Failed') {
                    toast.warning("Invalid Credentials", {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                } else if (error.response.data.message === 'NotExist') {
                    toast.warning("User not exist please Sign up first!", {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                } else {
                    toast.error("Internal Server Error!", {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                }
            }
            console.error(error);
        }
    };

    return (
        <section class="w-100">
            <style>
                {`
        .divider:after,
        .divider:before {
          ${styles.divider}
        }

        .h-custom {
          ${styles.hCustom}
        }

        @media (max-width: 450px) {
          .h-custom {
            ${styles.hCustomMobile}
          }
        }
      `}
            </style>
            <ToastContainer />
            <div className="container h-custom position-relative">
                <div className="position-absolute top-0 end-0 me-5" id="div-alert"></div>
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-md-9 col-lg-6 col-xl-6 my-lg-5 py-lg-5">
                        <img src="signin-image.jpg"
                            className="img-fluid ms-5" alt="Login" style={{ width: "370px" }} />
                    </div>
                    <div className="col-md-8 col-lg-6 col-xl-5 offset-xl-1 my-lg-5 py-lg-5">
                        <form id="loginForm" onSubmit={handleSubmit}>
                            <p className="text-center h1 fw-bold mb-5 mt-4">Login</p>
                            <div className="form-outline mb-4">
                                <input type="text" id="pno" name="pno"
                                    className="form-control form-control-lg" placeholder="Your Phone No"
                                    value={phoneNo}
                                    onChange={(e) => setPhoneNo(e.target.value)}
                                    required />
                                <div className="form-notch">
                                    <div className="form-notch-leading" style={{ width: "9px" }}></div>
                                    <div className="form-notch-middle" style={{ width: "88.8px" }}></div>
                                    <div className="form-notch-trailing"></div>
                                </div>
                            </div>

                            <div className="form-outline mb-3">
                                <input type="password" id="PasswordInput" name="PasswordInput"
                                    className="form-control form-control-lg" placeholder="Enter password" value={password}
                                    onChange={(e) => setPassword(e.target.value)} required />
                                <div className="form-notch">
                                    <div className="form-notch-leading" style={{ width: "9px" }}></div>
                                    <div className="form-notch-middle" style={{ width: "64px" }}></div>
                                    <div className="form-notch-trailing"></div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <a href="" id="forgotPasswordLink" className="text-body">Forgot
                                    password?</a>
                            </div>

                            <div className="text-center mt-4 pt-2">
                                <button type="submit" id="btnSubmit" className="btn btn-primary btn-lg"
                                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                                >Login</button>
                                <p className="h5 fw-bold mt-2 pt-1 mb-0">Don't have an account? <a href="/"
                                    className="link-danger">Register</a></p>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginForm;