const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

const PET_ID = new URLSearchParams(window.location.search).get("id");

if (!PET_ID) {
  alert("Etiqueta inválida");
  throw new Error("Sin ID");
}

const petRef = db.collection("pets").doc(PET_ID);

setTimeout(async () => {
  splash.style.display = "none";
  app.style.display = "block";

  const doc = await petRef.get();
  if (!doc.exists) owner.style.display = "block";
  else loadVisitor(doc.data());
}, 2000);

window.save = async () => {
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

  await petRef.set(data);
  loadVisitor(data);
};

function loadVisitor(data) {
  owner.style.display = "none";
  visitor.style.display = "block";
  vPetName.textContent = data.petName;
  info.innerHTML = `
    <b>Contacto:</b> ${data.phone}<br><br>
    <b>Mensaje:</b><br>${data.message || "—"}
  `;
}

window.unlock = async () => {
  const entered = prompt("PIN");
  const doc = await petRef.get();
  if (entered === doc.data().pin) {
    owner.style.display = "block";
    visitor.style.display = "none";
  } else alert("PIN incorrecto");
};

window.sendLocation = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const map = `https://maps.google.com?q=${pos.coords.latitude},${pos.coords.longitude}`;
    const msg = `Encontré a ${vPetName.textContent} 🐾\n${map}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  });
};
