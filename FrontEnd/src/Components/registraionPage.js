
import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const SignupForm = () => {
    const [name, setName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(avatar);
            const formData = new FormData();
            formData.append('name', name);
            formData.append('phoneNo', phoneNo);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('repeatPassword', repeatPassword);
            formData.append('avatar', avatar);
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/user/addUser`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.message === 'success') {
                toast.success("Registration Successful!", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                setTimeout(() => {
                    window.location = '/login';
                }, 2000)
            }
        } catch (error) {
            if (error.response.data.message) {
                toast.warning(error.response.data.message, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                toast.error('Internal Server Error!', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
            console.error(error);
        }

    }
    return (
        <div className=" container">
            <ToastContainer />
            <div className="bg-white border rounded-5">
                <div className="row">
                    <div className="col-12">
                        <div className="card text-black" style={{ borderRadius: '25px' }}>
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                                        <p className="text-center h1 fw-bold mb-5 mt-4">Sign up</p>
                                        <form id="registrationForm" method='POST' onSubmit={handleSubmit}>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input type="text" id="nameInput" name="nameInput" className="form-control"
                                                        placeholder='Your Name' value={name} onChange={(e) => setName(e.target.value)} required />
                                                    <div className="form-notch">
                                                        <div className="form-notch-leading" style={{ width: "9px" }}></div>
                                                        <div className="form-notch-middle" style={{ width: "71.2px" }}></div>
                                                        <div className="form-notch-trailing"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-camera fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input type="file" id="avatar" name="avatar" accept="image/*" className="form-control"
                                                        onChange={handleAvatarChange} />
                                                    <div className="form-notch">
                                                        <div className="form-notch-leading" style={{ width: "9px" }}></div>
                                                        <div className="form-notch-middle" style={{ width: "71.2px" }}></div>
                                                        <div className="form-notch-trailing"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-phone fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input type="number" id="phoneInput" name="phoneInput"
                                                        className="form-control" placeholder='Phone Number' value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} required />
                                                    <div className="form-notch">
                                                        <div className="form-notch-leading" style={{ width: "9px" }}></div>
                                                        <div className="form-notch-middle" style={{ width: "136px" }}></div>
                                                        <div className="form-notch-trailing"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input type="email" id="emailInput" name="emailInput"
                                                        className="form-control" placeholder='Your Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                                                    <div className="form-notch">
                                                        <div className="form-notch-leading" style={{ width: "9px" }}></div>
                                                        <div className="form-notch-middle" style={{ width: "69.6px" }}></div>
                                                        <div className="form-notch-trailing"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input type="password" id="passwordInput" name="passwordInput"
                                                        className="form-control" placeholder='Enter Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                                                    <div className="form-notch">
                                                        <div className="form-notch-leading" style={{ width: "9px" }}></div>
                                                        <div className="form-notch-middle" style={{ width: "64px" }}></div>
                                                        <div className="form-notch-trailing"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-key fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input type="password" id="confirmPasswordInput"
                                                        name="confirmPasswordInput" className="form-control" required placeholder='Repeat your
                                                        password' value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} />
                                                    <div className="form-notch">
                                                        <div className="form-notch-leading" style={{ width: '9px' }}></div>
                                                        <div className="form-notch-middle" style={{ width: '136px' }}></div>
                                                        <div className="form-notch-trailing"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center mt-4 pt-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-lg"
                                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                                    id="Registerbtn"
                                                >
                                                    Register
                                                </button>
                                                <p className="h5 fw-bold mt-2 pt-1 mb-0">Already a user? <a href="/login"
                                                    className="link-danger">Login</a></p>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="container position-relative">
                                        <div className="position-absolute top-0 end-0 me-5" id="div-alert">
                                        </div>
                                    </div>
                                    <div className=" col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                                        <img src="signup-image.jpg" className="img-fluid ms-5" style={{ width: "400px " }} alt="sign up image" />
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
