// ===============================
// 🔥 FIREBASE
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAT8FLvXeSSXXqvGnwHm678GfZWKfBC4tM",
  authDomain: "huella-segura-ef4dd.firebaseapp.com",
  projectId: "huella-segura-ef4dd",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// 🔎 LEER ID DESDE URL
// ===============================
const params = new URLSearchParams(window.location.search);
const petId = params.get("id");

// ===============================
// 🔄 EVITAR CACHÉ NFC / MÓVIL
// ===============================
window.addEventListener("pageshow", e => {
  if (e.persisted) window.location.reload();
});

// ===============================
// 🐾 ESTADO
// ===============================
let petData = null;

// ===============================
// 🚀 INICIO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (!petId) {
    alert("NFC inválido");
    return;
  }
  cargarMascota();
});

// ===============================
// 📥 CARGAR MASCOTA
// ===============================
async function cargarMascota() {
  petData = null;

  const ref = doc(db, "pets", petId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    petData = snap.data();
    mostrarVisitante();
  } else {
    mostrarDueño();
  }
}

// ===============================
// 👤 MODO DUEÑO
// ===============================
function mostrarDueño() {
  document.getElementById("ownerMode").classList.remove("hidden");
  document.getElementById("visitorMode").classList.add("hidden");
}

async function guardarDatos() {
  const data = {
    nombre: nombre.value,
    telefono: telefono.value,
    mensaje: mensaje.value,
    pin: pin.value
  };

  if (!data.nombre || !data.telefono || data.pin.length < 4) {
    alert("Completa todos los campos");
    return;
  }

  await setDoc(doc(db, "pets", petId), data);
  petData = data;
  mostrarVisitante();
}

// ===============================
// 👀 MODO VISITANTE
// ===============================
function mostrarVisitante() {
  document.getElementById("ownerMode").classList.add("hidden");
  document.getElementById("visitorMode").classList.remove("hidden");

  petName.textContent = "🐾 " + petData.nombre;
  petMsg.textContent = petData.mensaje;
}

// ===============================
// 📍 WHATSAPP UBICACIÓN
// ===============================
function enviarUbicacion() {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;

    const texto = `Hola, encontré a tu mascota 🐾
Mi ubicación es:
https://maps.google.com/?q=${latitude},${longitude}`;

    const url = `https://wa.me/${petData.telefono}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  }, () => alert("No se pudo obtener la ubicación"));
}

// ===============================
// 🔐 PIN
// ===============================
function mostrarPin() {
  document.getElementById("pinBox").classList.remove("hidden");
}

function verificarPin() {
  if (pinVerify.value === petData.pin) {
    mostrarDueño();
  } else {
    alert("PIN incorrecto");
  }
}
