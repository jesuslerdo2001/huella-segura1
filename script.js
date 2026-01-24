// Firebase config
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

// Obtener ID
const params = new URLSearchParams(window.location.search);
const PET_ID = params.get("id");

if (!PET_ID) {
  alert("❌ NFC sin ID");
  throw new Error("ID no encontrado");
}

const petRef = db.collection("pets").doc(PET_ID);

// Mostrar app SIEMPRE aunque falle Firebase
setTimeout(() => {
  splash.style.display = "none";
  app.style.display = "block";
  init();
}, 1500);

// Inicializar
async function init() {
  try {
    owner.style.display = "none";
    visitor.style.display = "none";

    const doc = await petRef.get();

    if (!doc.exists) {
      owner.style.display = "block";
    } else {
      loadVisitor(doc.data());
    }

  } catch (e) {
    console.error("Firebase error:", e);
    owner.style.display = "block"; // fallback modo dueño
  }
}

// Guardar
window.save = async function () {
  if (pin.value.length !== 4) {
    alert("PIN debe ser 4 dígitos");
    return;
  }

  const data = {
    petName: petName.value,
    phone: phone.value,
    message: message.value,
    pin: pin.value,
    updatedAt: Date.now()
  };

  await petRef.set(data);
  loadVisitor(data);
};

// Mostrar visitante
function loadVisitor(data) {
  owner.style.display = "none";
  visitor.style.display = "block";

  vPetName.textContent = data.petName || "Mascota registrada";
  info.innerHTML = `
    <b>Contacto:</b> ${data.phone}<br>
    <b>Mensaje:</b> ${data.message || "—"}
  `;
}

// Editar
window.unlock = async function () {
  const entered = prompt("PIN:");

  const doc = await petRef.get();
  if (!doc.exists) return;

  if (entered === doc.data().pin) {
    petName.value = doc.data().petName;
    phone.value = doc.data().phone;
    message.value = doc.data().message;
    pin.value = doc.data().pin;

    visitor.style.display = "none";
    owner.style.display = "block";
  } else {
    alert("PIN incorrecto");
  }
};

// Ubicación
window.sendLocation = function () {
  navigator.geolocation.getCurrentPosition(pos => {
    const map = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
    const text = `Encontré a ${vPetName.textContent} 🐾\n${map}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  });
};
