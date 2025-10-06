const PASSWORD_ADMIN = "semala123"; // ganti sesuai kebutuhan
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwT3UPGNJ8t_Zr1gN_0b5AR-3VR3sIUmv0aXQNHLzHq5GaNfOXfBw1RGJbrvqy0WwMuyg/exec"; // ganti dengan URL Apps Script
let dataAbsensi = [];
let daftarKelas = [];

// Login
function loginAdmin() {
  const pass = document.getElementById("passwordAdmin").value;
  if (pass === PASSWORD_ADMIN) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("absensiSection").style.display = "block";
    generateKelas();
    tampilkanTanggal();
    tampilkanJam();
    startQRScanner();
  } else {
    alert("Password salah!");
  }
}

// Generate kelas otomatis
function generateKelas() {
  const tingkat = ["X", "XI", "XII"];
  const huruf = ["A","B","C","D","E","F","G","H","I","J"];
  const kelasSelect = document.getElementById("kelas");
  const filterSelect = document.getElementById("filterKelas");
  tingkat.forEach(t => {
    huruf.forEach(h => {
      const k = `${t} ${h}`;
      daftarKelas.push(k);
      kelasSelect.innerHTML += `<option value="${k}">${k}</option>`;
      filterSelect.innerHTML += `<option value="${k}">${k}</option>`;
    });
  });
}

// Tambah data ke tabel & Google Sheets
function tambahData() {
  const nama = document.getElementById('nama').value;
  const kelas = document.getElementById('kelas').value;
  const nis = document.getElementById('nis').value;
  const status = document.getElementById('status').value;
  const keterangan = document.getElementById('keterangan').value;
  const fotoFile = document.getElementById('foto').files[0];
  const jam = new Date().toLocaleTimeString("id-ID");

  if (!nama || !kelas || !nis || !keterangan || !fotofile) return alert("Lengkapi data!");

  const reader = new FileReader();
  reader.onload = e => {
    const fotoURL = fotoFile ? e.target.result : "Tidak ada";
    const data = { Nama: nama, Kelas: kelas, NIS: nis, Status: status, Keterangan: keterangan, Jam: jam, Foto: fotoURL };
    dataAbsensi.push(data);
    tampilkanData();

    // kirim ke Google Sheets
   fetch(https://script.google.com/macros/s/AKfycbwT3UPGNJ8t_Zr1gN_0b5AR-3VR3sIUmv0aXQNHLzHq5GaNfOXfBw1RGJbrvqy0WwMuyg/exec, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });

    document.querySelector("form")?.reset();
    document.getElementById("foto").value = "";
  };
  if (fotoFile) reader.readAsDataURL(fotoFile); else reader.onload({ target:{ result:null } });
}

// QR Scanner
function startQRScanner() {
  const scanner = new Html5Qrcode("reader");
  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    qrText => {
      const [nama, kelas, nis] = qrText.split("|");
      document.getElementById("nama").value = nama;
      document.getElementById("kelas").value = kelas;
      document.getElementById("nis").value = nis;
      alert(`Data QR diterima: ${nama} (${kelas})`);
    }
  );
}

// Tabel tampil
function tampilkanData() {
  const filter = document.getElementById("filterKelas").value;
  const tbody = document.getElementById("tabelAbsensi").querySelector("tbody");
  tbody.innerHTML = "";
  dataAbsensi
    .filter(d => filter === "Semua" || d.Kelas === filter)
    .forEach(d => {
      tbody.innerHTML += `
        <tr>
          <td>${d.Nama}</td>
          <td>${d.Kelas}</td>
          <td>${d.NIS}</td>
          <td>${d.Status}</td>
          <td>${d.Keterangan}</td>
          <td>${d.Jam}</td>
          <td><img src="${d.Foto}" width="60"></td>
        </tr>`;
    });
}

// Download Excel otomatis sesuai kelas
function downloadExcel() {
  const filter = document.getElementById("filterKelas").value;
  const tanggal = new Date().toLocaleDateString("id-ID").replace(/\//g,"-");
  const namaFile = filter === "Semua" ? `Absensi_Semua_${tanggal}.xlsx` : `Absensi_Siswa_${filter.replace(" ","")}_${tanggal}.xlsx`;
  const data = dataAbsensi.filter(d => filter === "Semua" || d.Kelas === filter);
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Absensi");
  XLSX.writeFile(wb, namaFile);
}

// Tanggal & Jam real-time
function tampilkanTanggal() {
  const tgl = new Date().toLocaleDateString("id-ID", { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  document.getElementById("tanggalHariIni").textContent = tgl;
}
function tampilkanJam() {
  setInterval(() => {
    const jam = new Date().toLocaleTimeString("id-ID");
    document.getElementById("jamSekarang").textContent = "Jam: " + jam;
  }, 1000);
}
