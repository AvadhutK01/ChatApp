import React, { useState } from 'react';
import axios from 'axios';

const SignupForm = () => {
    const [name, setName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/user/addUser`, {
                name,
                phoneNo,
                email,
                password,
                repeatPassword,
            });
            if (response.data.message === 'success') {
                alert('Registration Successful!');
                window.location = '/login';
            }
        } catch (error) {
            if (error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert('Internal Server Error!');
            }
            console.error(error);
        }
    };

    return (
        <div className="main">
            <section className="signup">
                <div className="container">
                    <div className="signup-content">
                        <div className="signup-form">
                            <h2 className="form-title">Sign up</h2>
                            <form method="POST" className="register-form" id="register-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name"><i className="zmdi zmdi-account material-icons-name"></i></label>
                                    <input type="text" name="name" id="name" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="pno"><i className="zmdi zmdi-email"></i></label>
                                    <input type="number" name="pno" id="pno" placeholder="Your Phone No" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email"><i className="zmdi zmdi-email"></i></label>
                                    <input type="email" name="email" id="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="pass"><i className="zmdi zmdi-lock"></i></label>
                                    <input type="password" name="pass" id="pass" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="re-pass"><i className="zmdi zmdi-lock-outline"></i></label>
                                    <input type="password" name="re_pass" id="re_pass" placeholder="Repeat your password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <input type="checkbox" name="agree-term" id="agree-term" className="agree-term" />
                                    <label htmlFor="agree-term" className="label-agree-term"><span><span></span></span>I agree all
                                        statements in <a href="#" className="term-service">Terms of service</a></label>
                                </div>
                                <div className="form-group form-button">
                                    <input type="submit" name="signup" id="signup" className="form-submit" value="Register" />
                                </div>
                            </form>
                        </div>
                        <div className="signup-image">
                            <figure><img src="signup-image.jpg" alt="sign up image" /></figure>
                            <a href="/login" className="signup-image-link">I am already a member</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SignupForm;
