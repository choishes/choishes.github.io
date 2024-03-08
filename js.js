document.getElementById("passwordForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const password = document.getElementById("password").value;
    switch(password) {
        case "test": //Buat testing
            window.location.href = "https://instagram.com/zakitasnim";
            break;
        case "SURAT#01":
            window.location.href = "https://telegra.ph/Untuk-kamu-temanku-03-07";
            break;
        case "REVI#01":
            window.location.href = "https://docs.google.com/document/d/10eyC7YET1C3XKle7jHI7_eHc-XlbDKnehPwrG86MlcA/edit?usp=sharing";
            break;
        case "BILQIS#02":
            window.location.href = "https://telegra.ph/Untuk--Bilqis-Aqilah-S-03-07";
            break;
        case "RAYA#03":
            window.location.href = "https://telegra.ph/Untuk-kamu-temanku-03-07";
            break;
        case "ARA#04":
            window.location.href = "https://telegra.ph/Untuk--Siti-Zahra-Aura-Dhya-03-08";
            break;
        case "RAFA#05":
            window.location.href = "https://telegra.ph/Untuk--Rafa-Ramadhani-M-03-07";
            break;
        case "AVIRA#06":
            window.location.href = "https://telegra.ph/Untuk--Avira-Mayzeilasari-03-07";
            break;
        case "DKMXXI#07": //angkatan baru
            window.location.href = "";
            break;
        case "DKMXII#08": //al faruq
            window.location.href = "";
            break;
        case "X3#09": //Anak kelas X3 2021
            window.location.href = "";
            break;
        case "XII7#10": //11-7 dan 12-7 2023-2024
            window.location.href = "";
            break;
        case "MAKRAB#11": //Panitia makrab
            window.location.href = "";
            break;
        case "JC#12": //Japanese club
            window.location.href = "";
            break;
        case "TC#13": //Buat guru berjenis kelamin perempuan
            window.location.href = "";
            break;
        case "TC#14": //Buat guru berjenis kelamin laki-laki
            window.location.href = "";
            break;
    
        // Tambahkan case untuk password dan link baru sesuai kebutuhan
        default:
            alert("Kode salah, silahkan coba lagi. Hubungi Zaki untuk informasi lebih lanjut.");
    }
});
