const form = document.getElementById("passwordForm");
const searchResults = document.getElementById("searchResults");

form.addEventListener("submit", function(event) {
    event.preventDefault();
    const password = document.getElementById("password").value;
    
    // Cek password dan arahkan ke URL yang sesuai
    switch(password) {
        case "0001":
            window.location.href = "https://www.google.com/";
            break;
        case "0002":
            window.location.href = "https://www.example.com/page2";
            break;
        // Tambahkan case untuk password lainnya sesuai kebutuhan
        default:
            searchResults.innerHTML = "<div class='result'>Password salah. Silakan coba lagi.</div>";
    }
});
