<script>
/* ====== REFERENCIAS DOM ====== */
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

/* ====== ID ÚNICO DESDE URL ====== */
const params = new URLSearchParams(window.location.search);
const PET_ID = params.get("id");

if (!PET_ID) {
    alert("Etiqueta NFC inválida (ID no encontrado)");
}

/* ====== CLAVE ÚNICA POR MASCOTA ====== */
const STORAGE_KEY = `huella_${PET_ID}`;

/* ====== SPLASH ====== */
setTimeout(() => {
    splash.style.display = "none";
    app.style.display = "block";
    init();
}, 5000);

/* ====== INICIO ====== */
function init() {
    const data = getData();
    if (data) {
        loadVisitor(data);
    } else {
        loadOwner();
    }
}

/* ====== STORAGE ====== */
function getData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

function setData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ====== MODOS ====== */
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

/* ====== GUARDAR ====== */
function save() {
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

    setData(data);
    loadVisitor(data);
}

/* ====== DESBLOQUEAR ====== */
function unlock() {
    const data = getData();
    const entered = prompt("Ingresa el PIN");

    if (entered === data.pin) {
        petName.value = data.petName;
        phone.value = data.phone;
        message.value = data.message;
        owner.style.display = "block";
        visitor.style.display = "none";
    } else {
        alert("PIN incorrecto");
    }
}

/* ====== RESETEAR ====== */
function resetAll() {
    if (confirm("¿Eliminar la información de esta mascota?")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
}

/* ====== WHATSAPP CON UBICACIÓN ====== */
function sendLocation() {
    const data = getData();

    if (!navigator.geolocation) {
        alert("Geolocalización no disponible");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const text = `Hola, encontré a ${data.petName} 🐾\nMi ubicación: https://www.google.com/maps?q=${lat},${lon}`;
        window.open(`https://wa.me/${data.phone}?text=${encodeURIComponent(text)}`, "_blank");
    }, () => {
        alert("Debes permitir la ubicación");
    });
}
</script>
