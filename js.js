document.getElementById("passwordForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const password = document.getElementById("password").value;
    switch(password) {
        case "password1":
            window.location.href = "https://www.example.com/link1";
            break;
        case "password2":
            window.location.href = "https://www.example.com/link2";
            break;
        // Tambahkan case untuk password dan link baru sesuai kebutuhan
        default:
            alert("Kode salah, silahkan coba lagi. Hubungi Zaki untuk informasi lebih lanjut.");
    }
});
