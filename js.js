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
        case "chelin":
            window.location.href = "https://telegra.ph/Testingg-03-07";
            break;
        // Tambahkan case untuk password lainnya sesuai kebutuhan
        default:
            searchResults.innerHTML = "<div class='result'>Password salah. Silakan coba lagi.</div>";
    }
});
