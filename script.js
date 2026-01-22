/* ================= FIREBASE IMPORTS ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= CONFIG FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyAT8FLvXeSSXXqvGnwHm678GfZWKfBC4tM",
  authDomain: "huella-segura-ef4dd.firebaseapp.com",
  projectId: "huella-segura-ef4dd"
};

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

/* ================= ID DESDE NFC ================= */
const params = new URLSearchParams(window.location.search);
const PET_ID = params.get("id");

if (!PET_ID) {
  alert("Etiqueta NFC inválida");
  throw new Error("ID no encontrado");
}

const petRef = doc(db, "pets", PET_ID);

/* ================= DOM ================= */
const splash = document.getElementById("splash");
const app = document.getElementById("app");

const owner = document.getElementById("owner");
const visitor = document.getElementById("visitor");

const petName = document.getElementById("petName");
const phone = document.getElementById("phone");
const message = document.getElementById("message");
const pin = document.getElementById("pin");

const info = document.getElementById("info");

/* ================= SPLASH ================= */
setTimeout(async () => {
  splash.style.display = "none";
  app.style.display = "block";
  await init();
}, 5000);

/* ================= INIT ================= */
async function init() {
  const snap = await getDoc(petRef);

  if (!snap.exists()) {
    showOwner();
  } else {
    showVisitor(snap.data());
  }
}

/* ================= MODOS ================= */
function showOwner(data = {}) {
  owner.style.display = "block";
  visitor.style.display = "none";

  petName.value = data.petName || "";
  phone.value = data.phone || "";
  message.value = data.message || "";
}

function showVisitor(data) {
  owner.style.display = "none";
  visitor.style.display = "block";

  info.innerHTML = `
    <strong>Nombre:</strong> ${data.petName}<br>
    <strong>Contacto:</strong> ${data.phone}<br>
    <strong>Mensaje:</strong> ${data.message || "—"}
  `;
}

/* ================= GUARDAR ================= */
window.save = async function () {
  if (pin.value.length !== 4) {
    alert("El PIN debe ser de 4 dígitos");
    return;
  }

  await setDoc(petRef, {
    petName: petName.value,
    phone: phone.value,
    message: message.value,
    pin: pin.value
  });

  alert("Información guardada correctamente");
  location.reload();
};

/* ================= DESBLOQUEAR ================= */
window.unlock = async function () {
  const entered = prompt("Ingresa el PIN");
  const snap = await getDoc(petRef);

  if (snap.data().pin === entered) {
    showOwner(snap.data());
  } else {
    alert("PIN incorrecto");
  }
};

/* ================= UBICACIÓN (FASE 2) ================= */
window.sendLocation = async function () {
  if (!navigator.geolocation) {
    alert("Geolocalización no disponible");
    return;
  }

  const snap = await getDoc(petRef);
  const data = snap.data();

  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    await updateDoc(petRef, {
      lastScan: {
        lat,
        lng,
        date: new Date()
      }
    });

    const text = `Hola, encontré a ${data.petName} 🐾
https://maps.google.com/?q=${lat},${lng}`;

    window.open(
      `https://wa.me/${data.phone}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }, () => {
    alert("Debes permitir el acceso a la ubicación");
  });
};
