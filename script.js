// Sistem pendaftaran Coding Academy menggunakan localStorage.
// Data hanya tersimpan di browser/perangkat yang digunakan.

const form = document.getElementById("registrationForm");
const formContainer = document.getElementById("formContainer");
const hasilPendaftaran = document.getElementById("hasilPendaftaran");
const detailHasil = document.getElementById("detailHasil");
const participantTable = document.getElementById("participantTable");
const btnEdit = document.getElementById("btnEdit");
const btnPendaftaranBaru = document.getElementById("btnPendaftaranBaru");
const STORAGE_KEY = "codingAcademyPeserta";

let pesertaAktif = null;

function ambilPeserta() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Data peserta tidak dapat dibaca:", error);
    alert("Data tersimpan tidak dapat dibaca. Periksa penyimpanan browser.");
    return [];
  }
}

function simpanPeserta(daftar) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(daftar));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    alert("Data tidak dapat disimpan. Periksa ruang penyimpanan browser.");
    return false;
  }
}

function escapeHTML(nilai) {
  return String(nilai ?? "").replace(/[&<>"']/g, (karakter) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[karakter]);
}

function bacaFormulir() {
  return {
    nik: document.getElementById("nik").value.trim(),
    nama: document.getElementById("nama").value.trim(),
    jenisKelamin: document.getElementById("jenisKelamin").value,
    telepon: document.getElementById("telepon").value.trim(),
    alamat: document.getElementById("alamat").value.trim(),
    bahasa: document.getElementById("bahasa").value
  };
}

function tanggalSekarang() {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(new Date());
}

function buatIdPeserta() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

function tampilkanHasil(peserta) {
  if (!peserta) return;

  const informasi = [
    ["NIK", peserta.nik],
    ["Nama Lengkap", peserta.nama],
    ["Jenis Kelamin", peserta.jenisKelamin],
    ["Nomor Telepon", peserta.telepon],
    ["Alamat", peserta.alamat],
    ["Bahasa Pemrograman", peserta.bahasa],
    ["Tanggal Daftar", peserta.tanggalDaftar]
  ];

  detailHasil.innerHTML = informasi.map(([label, nilai]) =>
    `<dt>${escapeHTML(label)}</dt><dd>${escapeHTML(nilai)}</dd>`
  ).join("");

  formContainer.hidden = true;
  hasilPendaftaran.hidden = false;
  document.getElementById("pendaftaran").scrollIntoView({
    behavior: "smooth", block: "start"
  });
}

function tampilkanFormulir() {
  hasilPendaftaran.hidden = true;
  formContainer.hidden = false;
  document.getElementById("pendaftaran").scrollIntoView({
    behavior: "smooth", block: "start"
  });
}

function formulirBaru() {
  form.reset();
  pesertaAktif = null;
  tampilkanFormulir();
  document.getElementById("nik").focus();
}

function tampilkanTabel() {
  const daftar = ambilPeserta();

  if (daftar.length === 0) {
    participantTable.innerHTML = '<tr><td colspan="5" class="empty-table">Belum ada peserta terdaftar.</td></tr>';
    return;
  }

  participantTable.innerHTML = daftar.map((peserta, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHTML(peserta.nama)}</td>
      <td>${escapeHTML(peserta.bahasa)}</td>
      <td>${escapeHTML(peserta.tanggalDaftar)}</td>
      <td><div class="action-buttons">
        <button type="button" class="small-btn" data-action="lihat" data-id="${escapeHTML(peserta.id)}">Lihat / Edit</button>
        <button type="button" class="small-btn delete-btn" data-action="hapus" data-id="${escapeHTML(peserta.id)}">Hapus</button>
      </div></td>
    </tr>
  `).join("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const dataForm = bacaFormulir();

  if (!/^[0-9]{16}$/.test(dataForm.nik)) {
    alert("NIK harus terdiri dari tepat 16 digit angka.");
    document.getElementById("nik").focus();
    return;
  }

  const daftar = ambilPeserta();
  const nikDuplikat = daftar.some((peserta) =>
    peserta.nik === dataForm.nik &&
    (!pesertaAktif || peserta.id !== pesertaAktif.id)
  );

  if (nikDuplikat) {
    alert("NIK ini sudah terdaftar. Periksa kembali data peserta.");
    document.getElementById("nik").focus();
    return;
  }

  const yakin = confirm(pesertaAktif
    ? "Apakah Anda yakin ingin memperbarui data peserta?"
    : "Apakah Anda yakin ingin menyimpan pendaftaran?");

  if (!yakin) return;

  let pesertaUntukDitampilkan;

  if (pesertaAktif) {
    const indeks = daftar.findIndex((peserta) => peserta.id === pesertaAktif.id);

    if (indeks === -1) {
      alert("Data peserta tidak ditemukan. Silakan muat ulang halaman.");
      pesertaAktif = null;
      return;
    }

    pesertaUntukDitampilkan = {
      ...daftar[indeks],
      ...dataForm,
      id: daftar[indeks].id,
      tanggalDaftar: daftar[indeks].tanggalDaftar
    };
    daftar[indeks] = pesertaUntukDitampilkan;
  } else {
    pesertaUntukDitampilkan = {
      ...dataForm,
      id: buatIdPeserta(),
      tanggalDaftar: tanggalSekarang()
    };
    daftar.push(pesertaUntukDitampilkan);
  }

  if (!simpanPeserta(daftar)) return;

  pesertaAktif = pesertaUntukDitampilkan;
  tampilkanTabel();
  tampilkanHasil(pesertaUntukDitampilkan);
});

btnEdit.addEventListener("click", () => {
  if (!pesertaAktif) return;
  const peserta = pesertaAktif;

  document.getElementById("nik").value = peserta.nik;
  document.getElementById("nama").value = peserta.nama;
  document.getElementById("jenisKelamin").value = peserta.jenisKelamin;
  document.getElementById("telepon").value = peserta.telepon;
  document.getElementById("alamat").value = peserta.alamat;
  document.getElementById("bahasa").value = peserta.bahasa;

  tampilkanFormulir();
  document.getElementById("nama").focus();
});

btnPendaftaranBaru.addEventListener("click", formulirBaru);

participantTable.addEventListener("click", (event) => {
  const tombol = event.target.closest("button[data-action]");
  if (!tombol) return;

  const id = tombol.dataset.id;
  const aksi = tombol.dataset.action;
  const daftar = ambilPeserta();
  const peserta = daftar.find((item) => item.id === id);

  if (!peserta) {
    alert("Data peserta tidak ditemukan.");
    tampilkanTabel();
    return;
  }

  if (aksi === "lihat") {
    pesertaAktif = peserta;
    document.getElementById("nik").value = peserta.nik;
    document.getElementById("nama").value = peserta.nama;
    document.getElementById("jenisKelamin").value = peserta.jenisKelamin;
    document.getElementById("telepon").value = peserta.telepon;
    document.getElementById("alamat").value = peserta.alamat;
    document.getElementById("bahasa").value = peserta.bahasa;
    tampilkanHasil(peserta);
  }

  if (aksi === "hapus") {
    if (!confirm("Apakah Anda yakin ingin menghapus data peserta ini?")) return;

    const daftarBaru = daftar.filter((item) => item.id !== id);
    if (!simpanPeserta(daftarBaru)) return;

    if (pesertaAktif && pesertaAktif.id === id) {
      pesertaAktif = null;
      form.reset();
      hasilPendaftaran.hidden = true;
      formContainer.hidden = false;
    }

    tampilkanTabel();
    alert("Data peserta berhasil dihapus.");
  }
});

// Muat daftar peserta saat halaman dibuka.
tampilkanTabel();
