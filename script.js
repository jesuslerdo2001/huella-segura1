// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAT8FLvXeSSXXqvGnwHm678GfZWKfBC4tM",
  authDomain: "huella-segura-ef4dd.firebaseapp.com",
  projectId: "huella-segura-ef4dd"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM
const splash = document.getElementById("splash");
const app = document.getElementById("app");
const owner = document.getElementById("owner");
const visitor = document.getElementById("visitor");

const petName = document.getElementById("petName");
const phone = document.getElementById("phone");
const message = document.getElementById("message");
const pin = document.getElementById("pin");

const vPetName = document.getElementById("vPetName");
const info = document.getElementById("info");

// URL ID
const params = new URLSearchParams(window.location.search);
const PET_ID = params.get("id");

if (!PET_ID) {
  alert("Etiqueta NFC inválida");
  throw new Error("ID no proporcionado");
}

const petRef = db.collection("pets").doc(PET_ID);

// SPLASH
setTimeout(() => {
  splash.style.display = "none";
  app.style.display = "block";
  init();
}, 3000);

// INIT
async function init() {
  owner.style.display = "none";
  visitor.style.display = "none";

  const snap = await petRef.get();

  if (!snap.exists) {
    owner.style.display = "block";
  } else {
    loadVisitor(snap.data());
  }
}

// SAVE
window.save = async function () {
  if (pin.value.length !== 4) {
    alert("El PIN debe ser de 4 dígitos");
    return;
  }

  const data = {
    petName: petName.value,
    phone: phone.value,
    message: message.value,
    pin: pin.value,
    updated: Date.now()
  };

  await petRef.set(data);
  loadVisitor(data);
};

// VISITOR
function loadVisitor(data) {
  owner.style.display = "none";
  visitor.style.display = "block";

  vPetName.textContent = data.petName;
  info.innerHTML = `
    <strong>Contacto:</strong> ${data.phone}<br>
    <strong>Mensaje:</strong> ${data.message || "—"}
  `;
}

// UNLOCK
window.unlock = async function () {
  const entered = prompt("Ingresa el PIN");
  const snap = await petRef.get();

  if (!snap.exists) return;

  if (entered === snap.data().pin) {
    petName.value = snap.data().petName;
    phone.value = snap.data().phone;
    message.value = snap.data().message;
    pin.value = snap.data().pin;

    visitor.style.display = "none";
    owner.style.display = "block";
  } else {
    alert("PIN incorrecto");
  }
};

// LOCATION
window.sendLocation = function () {
  navigator.geolocation.getCurrentPosition(pos => {
    const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
    const text = `Hola, encontré a ${vPetName.textContent} 🐾\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }, () => alert("Permite el acceso a ubicación"));
};
