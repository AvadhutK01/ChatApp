const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const PhoneInput = document.getElementById('pno').value;
    const passwordInput = document.getElementById('password').value;
    let data = {
        phoneNO: PhoneInput,
        password: passwordInput
    };
    try {
        const result = await axios.post('/user/verify-login', data);
        if (result.data.message === 'success') {
            alert('Login Successful!');
            localStorage.setItem('token', result.data.token);
            window.location = `/chat/Main`;
        }
    } catch (error) {
        if (error.response.data.message) {
            if (error.response.data.message == 'Failed') {
                alert('Invalid Credentials');
            } else if (error.response.data.message === 'NotExist') {
                alert('User not exist please Sign up first!')
            }
            else {
                alert(error.response.data.message);
            }
        }
        else {
            alert('Internal Server Error!')
        }
        console.log(error)
    }
});