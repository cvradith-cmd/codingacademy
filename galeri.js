// Pencarian dan filter kategori galeri.
const searchGallery = document.getElementById("searchGallery");
const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));
const noGalleryResult = document.getElementById("noGalleryResult");
const filterButtons = document.querySelectorAll(".filter-btn");

let kategoriAktif = "semua";

function filterGaleri() {
  const kataKunci = searchGallery.value.toLowerCase().trim();
  let jumlahCocok = 0;

  galleryCards.forEach((kartu) => {
    const isiKartu = kartu.textContent.toLowerCase();
    const kataTambahan = (kartu.dataset.keywords || "").toLowerCase();
    const cocokKata = isiKartu.includes(kataKunci) || kataTambahan.includes(kataKunci);
    const cocokKategori = kategoriAktif === "semua" || kartu.dataset.category === kategoriAktif;
    const tampil = cocokKata && cocokKategori;

    kartu.hidden = !tampil;
    if (tampil) jumlahCocok++;
  });

  noGalleryResult.hidden = jumlahCocok > 0;
}

searchGallery.addEventListener("input", filterGaleri);

filterButtons.forEach((tombol) => {
  tombol.addEventListener("click", () => {
    kategoriAktif = tombol.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === tombol));
    filterGaleri();
  });
});
