document.getElementById("register-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const nameInput = document.getElementById("name").value;
    const phoneInput = document.getElementById("pno").value;
    const emailInput = document.getElementById("email").value;
    const passwordInput = document.getElementById("pass").value;
    const rePassInput = document.getElementById('re_pass').value;

    if (passwordInput === rePassInput) {
        const formData = {
            nameInput: nameInput,
            phoneInput: phoneInput,
            emailInput: emailInput,
            passwordInput: passwordInput
        };

        try {
            const response = await axios.post("/user/addUser", formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = response.data;
            if (data.message === "success") {
                alert('Success')
                window.location = '/user/login';
            }
        } catch (error) {
            if (error.response.data.message) {
                if (error.response.data.message === "exist") {
                    alert('User Exist')
                } else {
                    alert('Error')
                }
            }
            else {
                alert('Error')
            }
            console.log(error)
        }
    } else {
        alert('Passwords Do not match')
    }
});
