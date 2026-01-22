document.addEventListener("DOMContentLoaded", () => {

const splash = document.getElementById("splash");
const app = document.getElementById("app");

const owner = document.getElementById("owner");
const visitor = document.getElementById("visitor");

const petName = document.getElementById("petName");
const phone = document.getElementById("phone");
const message = document.getElementById("message");
const pin = document.getElementById("pin");

const petTitle = document.getElementById("petTitle");
const petInfo = document.getElementById("petInfo");

const params = new URLSearchParams(window.location.search);
const PET_ID = params.get("id");

if (!PET_ID) {
  alert("Etiqueta NFC inválida");
  return;
}

const STORAGE_KEY = `huella_${PET_ID}`;

setTimeout(() => {
  splash.style.display = "none";
  app.classList.remove("hidden");
  init();
}, 5000);

function init() {
  const data = loadData();
  data ? showVisitor(data) : showOwner();
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function showOwner() {
  owner.classList.remove("hidden");
  visitor.classList.add("hidden");
}

function showVisitor(data) {
  owner.classList.add("hidden");
  visitor.classList.remove("hidden");

  petTitle.textContent = data.petName;
  petInfo.innerHTML = `
    📞 ${data.phone}<br>
    📝 ${data.message || "Sin mensaje"}
  `;
}

/* ====== FUNCIONES GLOBALES ====== */

window.save = () => {
  if (pin.value.length !== 4) {
    alert("El PIN debe ser de 4 dígitos");
    return;
  }

  const data = {
    petName: petName.value,
    phone: phone.value,
    message: message.value,
    pin: pin.value
  };

  saveData(data);
  showVisitor(data);
};

window.unlock = () => {
  const data = loadData();
  const entered = prompt("Ingresa el PIN");

  if (entered === data.pin) {
    petName.value = data.petName;
    phone.value = data.phone;
    message.value = data.message;
    showOwner();
  } else {
    alert("PIN incorrecto");
  }
};

window.sendLocation = () => {
  const data = loadData();
  navigator.geolocation.getCurrentPosition(pos => {
    const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
    const msg = `Hola, encontré a ${data.petName} 🐾\n${url}`;
    window.open(`https://wa.me/${data.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }, () => alert("Permite ubicación"));
};

});
