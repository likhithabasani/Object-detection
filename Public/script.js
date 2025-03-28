document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
});

// ✅ Check login status and update UI accordingly
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("userLoggedIn");

    if (isLoggedIn) {
        document.getElementById("login-btn").style.display = "none";
        document.getElementById("signup-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "block";
        document.getElementById("form-section").style.display = "none"; // Hide login/signup forms
    } else {
        document.getElementById("login-btn").style.display = "block";
        document.getElementById("signup-btn").style.display = "block";
        document.getElementById("logout-btn").style.display = "none";
        document.getElementById("form-section").style.display = "block"; // Show login/signup forms
    }
}

// ✅ Login Function
function login(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Login successful!");
            localStorage.setItem("userLoggedIn", "true");
            localStorage.setItem("authToken", data.token);
            checkLoginStatus();
        } else {
            alert("Invalid credentials. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error during login:", error);
        alert("Error during login.");
    });
}


function logout() {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("authToken");
    alert("Logged out successfully!");
    checkLoginStatus();
}

function signup(event) {
    event.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const messageBox = document.getElementById("signup-message"); // 📌 Display area for messages

    // ✅ Password validation regex
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(password)) {
        messageBox.innerText = "Password must be at least 6 characters long, include one uppercase letter, one number, and one special character.";
        messageBox.style.color = "red";
        return;
    }

    fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data }))) 
    .then(({ status, body }) => {
        if (status === 201) {
            messageBox.innerText = "Signup successful! Please log in.";
            messageBox.style.color = "green";
            showLoginForm();
        } else if (status === 409) { 
            messageBox.innerText = "Email already exists. Please log in or use a different email.";
            messageBox.style.color = "red";
        } else {
            messageBox.innerText = body.message; 
            messageBox.style.color = "red";
        }
    })
    .catch(error => {
        console.error("Error during signup:", error);
        messageBox.innerText = "Error during signup.";
        messageBox.style.color = "red";
    });
}

// ✅ Forgot Password Function
function forgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById("forgot-email").value;
    
    fetch("http://localhost:3000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            resetEmail = email;  // Store the email for reset
            showResetPasswordForm();
        } else {
            alert("User not found. Please check your email.");
        }
    })
    .catch(error => {
        console.error("Error during forgot password:", error);
        alert("Error processing request.");
    });
}

// **Reset Password Function**
function resetPassword(event) {
    event.preventDefault();
    const newPassword = document.getElementById("reset-password").value;

    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    fetch("http://localhost:3000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Password changed successfully!");
            showLoginForm();
        } else if (data.error === "recent_password") {  // ✅ Handle recent password error
            alert("Don't use recent passwords. Please choose a new one.");
        } else {
            alert("Error resetting password. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error during reset password:", error);
        alert("Error processing request.");
    });
}

function showForgotPasswordForm() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("forgot-password-form").style.display = "block";
    document.getElementById("reset-password-form").style.display = "none";
}

// ✅ Show Login Form
function showLoginForm() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("forgot-password-form").style.display = "none";
    document.getElementById("reset-password-form").style.display = "none";
}


document.getElementById("back-to-login").addEventListener("click", function() {
    showLoginForm(); // Ensures only login form is visible
});

// ✅ Show Signup Form
function showSignupForm() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
    document.getElementById("forgot-password-form").style.display = "none";
    document.getElementById("reset-password-form").style.display = "none";
}
function showResetPasswordForm() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("reset-password-form").style.display = "block";
    document.getElementById("forgot-password-form").style.display = "none";
}
function openCamera() {
    if (!localStorage.getItem("userLoggedIn")) {
        alert("Please log in to access YOLO detection.");
        showLoginForm();
        return;
    }

    fetch("http://localhost:3000/open-camera")
        .then((response) => response.json())
        .then((data) => {
            alert(data.message); // ✅ Notify user that YOLO started

            // ✅ Show "Close Camera" button (even if camera is not opened)
            document.getElementById("close-camera-btn").style.display = "inline-block";
        })
        .catch((error) => {
            console.error("Error starting YOLO detection:", error);
            alert("Error starting YOLO detection.");
        });
}

// ✅ Close Camera & Stop YOLO
function closeCamera() {
    fetch("http://localhost:3000/close-camera")
        .then((response) => response.json())
        .then((data) => {
            alert(data.message); // ✅ Notify user that YOLO stopped

            // ✅ Hide "Close Camera" button after stopping YOLO
            document.getElementById("close-camera-btn").style.display = "none";
        })
        .catch((error) => {
            console.error("Error closing YOLO:", error);
        });
    }