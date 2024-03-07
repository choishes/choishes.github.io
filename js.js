document.getElementById("passwordForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const password = document.getElementById("password").value;
    switch(password) {
        case "SURAT#01":
            window.location.href = "https://telegra.ph/Untuk-kamu-temanku-03-07";
            break;
        case "REVI#01":
            window.location.href = "https://docs.google.com/document/d/10eyC7YET1C3XKle7jHI7_eHc-XlbDKnehPwrG86MlcA/edit?usp=sharing";
            break;
        // Tambahkan case untuk password dan link baru sesuai kebutuhan
        default:
            alert("Kode salah, silahkan coba lagi. Hubungi Zaki untuk informasi lebih lanjut.");
    }
});
