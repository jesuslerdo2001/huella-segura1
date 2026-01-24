// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAT8FLvXeSSXXqvGnwHm678GfZWKfBC4tM",
  authDomain: "huella-segura-ef4dd.firebaseapp.com",
  projectId: "huella-segura-ef4dd"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Esperar DOM
document.addEventListener("DOMContentLoaded", () => {

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
    splash.innerHTML = "Etiqueta NFC inválida";
    return;
  }

  const petRef = db.collection("pets").doc(PET_ID);

  // Splash
  setTimeout(async () => {
    splash.style.display = "none";
    app.style.display = "block";

    await init();
  }, 2500);

  // Init
  async function init() {
    try {
      owner.style.display = "none";
      visitor.style.display = "none";

      const doc = await petRef.get();

      if (!doc.exists) {
        owner.style.display = "block";   // primera vez
      } else {
        loadVisitor(doc.data());         // ya existe
      }

    } catch (e) {
      console.error("ERROR FIREBASE:", e);
      owner.style.display = "block"; // fallback seguro
    }
  }

  // Guardar
  window.save = async function () {
    try {
      if (pin.value.length !== 4) {
        alert("El PIN debe ser de 4 dígitos");
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

    } catch (e) {
      alert("Error al guardar");
      console.error(e);
    }
  };

  // Mostrar visitante
  function loadVisitor(data) {
    owner.style.display = "none";
    visitor.style.display = "block";

    vPetName.textContent = data.petName;
    info.innerHTML = `
      <strong>Contacto:</strong> ${data.phone}<br>
      <strong>Mensaje:</strong> ${data.message || "—"}
    `;
  }

  // Desbloquear
  window.unlock = async function () {
    try {
      const entered = prompt("Ingresa el PIN");
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
    } catch (e) {
      console.error(e);
    }
  };

  // Ubicación
  window.sendLocation = function () {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const map = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        const text = `Hola, encontré a ${vPetName.textContent} 🐾\n${map}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      },
      () => alert("Permite el acceso a la ubicación")
    );
  };

});
