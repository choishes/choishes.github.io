/* ================================================================
   SINYAL — VERSI
   Format X.YZ. Naikkan YZ tiap update; naikkan X untuk rilis besar.
   Angka ini otomatis tampil di homescreen (chip di bawah judul) dan
   di pojok kanan atas. Riwayat lengkap ada di CLAUDE.md.
   ================================================================ */
const SINYAL_VERSION = "2.26"; // ← update di SINI setiap ada perubahan

document.addEventListener("DOMContentLoaded", ()=>{
  const v = "v"+SINYAL_VERSION;
  const chip = document.getElementById("verChip");
  const count = document.getElementById("count");
  if(chip)  chip.textContent = v;
  if(count) count.textContent = v;
});
