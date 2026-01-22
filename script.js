/* ====== REFERENCIAS DOM ====== */
document.addEventListener("DOMContentLoaded", () => {

const splash = document.getElementById("splash");
const app = document.getElementById("app");
const owner = document.getElementById("owner");
const visitor = document.getElementById("visitor");

const petName = document.getElementById("petName");
const phone = document.getElementById("phone");
const message = document.getElementById("message");
const pin = document.getElementById("pin");
const info = document.getElementById("info");
const resetBtn = document.getElementById("resetBtn");

/* ====== ID ÚNICO ====== */
const params = new URLSearchParams(window.location.search);
const PET_ID = params.get("id");

if (!PET_ID) {
    alert("Etiqueta NFC inválida");
    return;
}

const STORAGE_KEY = `huella_${PET_ID}`;

/* ====== SPLASH ====== */
setTimeout(() => {
    splash.style.display = "none";
    app.style.display = "block";
    init();
}, 5000);

/* ====== FUNCIONES ====== */

function init() {
    const data = getData();
    data ? loadVisitor(data) : loadOwner();
}

function getData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

function setData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadOwner() {
    owner.style.display = "block";
    visitor.style.display = "none";
}

function loadVisitor(data) {
    owner.style.display = "none";
    visitor.style.display = "block";
    info.innerHTML = `
        <strong>Nombre:</strong> ${data.petName}<br>
        <strong>Contacto:</strong> ${data.phone}<br>
        <strong>Mensaje:</strong> ${data.message || "—"}
    `;
}

/* ====== EXPONER FUNCIONES ====== */
window.save = function () {
    if (pin.value.length !== 4) {
        alert("PIN de 4 dígitos");
        return;
    }

    const data = {
        petName: petName.value,
        phone: phone.value,
        message: message.value,
        pin: pin.value
    };

    setData(data);
    loadVisitor(data);
};

window.unlock = function () {
    const data = getData();
    const entered = prompt("Ingresa el PIN");
    if (entered === data.pin) {
        petName.value = data.petName;
        phone.value = data.phone;
        message.value = data.message;
        loadOwner();
    } else {
        alert("PIN incorrecto");
    }
};

window.resetAll = function () {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
};

window.sendLocation = function () {
    const data = getData();
    navigator.geolocation.getCurrentPosition(pos => {
        const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        const text = `Hola, encontré a ${data.petName} 🐾\n${url}`;
        window.open(`https://wa.me/${data.phone}?text=${encodeURIComponent(text)}`, "_blank");
    }, () => alert("Permite ubicación"));
};

});
