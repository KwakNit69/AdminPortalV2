function login(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Hardcoded demo credentials
    if (email === "admin" && password === "admin") {
        alert("Login successful!");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials. Use admin / admin");
    }
}

function register(event) {
    event.preventDefault();
    alert("Registration submitted successfully!");
    window.location.href = "index.html";
}