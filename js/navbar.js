document.addEventListener("DOMContentLoaded", function () {
    fetch("pages/components/navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-container").innerHTML = data;
        })
        .catch(error => console.error("Navbar failed to load:", error));
});