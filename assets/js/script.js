// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTIeTmg_Zj4mjJbsMh_FxNMWCzxQBpxH4",
  authDomain: "rifa-rotura-lca.firebaseapp.com",
  projectId: "rifa-rotura-lca",
  storageBucket: "rifa-rotura-lca.firebasestorage.app",
  messagingSenderId: "770429517367",
  appId: "1:770429517367:web:6c8ce874cf4650638989b2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const numerosRef = collection(db, "numeros");

// URLs y campos del formulario de Google
document.addEventListener("DOMContentLoaded", () => {

  const grid = document.getElementById("grid-numeros");
  const btnGuardar = document.getElementById("guardarNumeros");
  const contadorDisponibles = document.getElementById("contadorDisponibles");

  const modalForm = document.getElementById("modalFormUsuario");
  const closeForm = document.getElementById("closeFormModal");
  const formUsuario = modalForm?.querySelector("form");

  const modalTransferencia = document.getElementById("modalTransferencia");
  const btnIconoTransferir = document.getElementById("btnTransferir");
  const linkDatosPagoMenu = document.getElementById("datosPago");
  const btnCerrarTransferencia = document.getElementById("closeModal");
  const btnCopiarDatos = document.getElementById("confirmModal");
  const btnAgendar= document.getElementById("btnAgendar")

  let numerosSeleccionados = [];
  let formLlenado = false;
  let datosUsuario = null;
  let totalDisponibles = 400;

  /* =====================================================
      FUNCIÓN PARA BLOQUEAR NÚMEROS YA VENDIDOS
  ===================================================== */
 document.querySelectorAll(".numero").forEach(div => {
  div.classList.remove("bloqueado");
  div.style.pointerEvents = "";
  div.style.backgroundColor = "";
  div.style.color = "";
});

  onSnapshot(numerosRef, (snapshot) => {
    const ocupados = snapshot.docs.map(d => d.id);

    document.querySelectorAll(".numero").forEach(div => {
      if (ocupados.includes(div.textContent)) {
        div.classList.add("bloqueado");
        div.style.pointerEvents = "none";
        div.style.backgroundColor = "#d1d5db";
        div.style.color = "#9ca3af";
      }
    });

    totalDisponibles = 400 - ocupados.length;
    if (contadorDisponibles) contadorDisponibles.textContent = totalDisponibles;
  });

  // Rifa de 400 números
  for (let i = 1; i <= 400; i++) {
    const btn = document.createElement("div");
    btn.className = "numero";
    btn.textContent = i.toString().padStart(3, "0");

    btn.addEventListener("click", () => {
      if (btn.classList.contains("bloqueado")) return;

      if (!formLlenado) {
        modalForm.style.display = "flex";
        document.body.style.overflow = "hidden";
        return;
      }

      btn.classList.toggle("seleccionado");
      if (btn.classList.contains("seleccionado")) {
        numerosSeleccionados.push(i);
      } else {
        numerosSeleccionados = numerosSeleccionados.filter(n => n !== i);
      }
    });

    grid.appendChild(btn);
  }

  // Formulario usuario
  formUsuario?.addEventListener("submit", (e) => {
    e.preventDefault();

  const inputs = formUsuario.querySelectorAll("input");
  let todoOk = true;

  inputs.forEach(input => {
   if (input.value.trim() === "") {
    input.classList.add("input-error", "shake");
        todoOk = false;
      }
    });

    if (!todoOk) return;

    const nombre = formUsuario.querySelector("input[placeholder='Ingrese su nombre']").value;
    const apellido = formUsuario.querySelector("input[placeholder='Ingrese su apellido']").value;
    const contacto = formUsuario.querySelector("input[placeholder='Ingrese su correo o ig']").value;
    const telefono = formUsuario.querySelector("input[placeholder='Ingrese su número de teléfono']").value;

    datosUsuario = {
      nombre: `${nombre} ${apellido}`,
      contacto,
      telefono,
      fechaRegistro: new Date().toISOString()
    };

    formLlenado = true;
    modalForm.style.display = "none";
    document.body.style.overflow = "";

    alert("✅ Datos listos. Ahora selecciona tus números y luego presiona 'Comprar Número'.");
  });

  closeForm?.addEventListener("click", () => {
    modalForm.style.display = "none";
    document.body.style.overflow = "";
    formUsuario.reset();
  });

  // Botón números seleccionados
  btnGuardar.addEventListener("click", async () => {
    if (!datosUsuario || numerosSeleccionados.length === 0) {
      alert("⚠️ Selecciona al menos un número.");
      return;
    }

    try {
      for (const n of numerosSeleccionados) {
        const id = n.toString().padStart(3, "0");

        await setDoc(doc(db, "numeros", id), {
          ...datosUsuario,
          numero: id,
          fecha: serverTimestamp()
        });
      }

      document.querySelectorAll(".numero.seleccionado").forEach(el => {
        el.classList.remove("seleccionado");
        el.classList.add("bloqueado");
      });

      totalDisponibles -= numerosSeleccionados.length;
      contadorDisponibles.textContent = totalDisponibles;
      numerosSeleccionados = [];

      alert("🎉 ¡Número reservado correctamente!");
    } catch (e) {
      alert("❌ Ese número ya fue tomado");
    }
  });

  // Modal transferencia
  const toggleTransferencia = (e, show) => {
    if (e) e.preventDefault();
    modalTransferencia.style.display = show ? "flex" : "none";
    document.body.style.overflow = show ? "hidden" : "";
  };

  btnIconoTransferir?.addEventListener("click", (e) => toggleTransferencia(e, true));
  linkDatosPagoMenu?.addEventListener("click", (e) => toggleTransferencia(e, true));
  btnCerrarTransferencia?.addEventListener("click", () => toggleTransferencia(null, false));
  btnCopiarDatos?.addEventListener("click", () => {
    const info = "Banco: Mercado Pago\nN° de Cuenta: 1019481756\nTitular: Vivian Roa Tapia";
    navigator.clipboard.writeText(info).then(() => alert("✅ Copiado."));
  });

  //Google calendar
const hoy = new Date();
const fechaSorteo = new Date(2026, 2, 2); // 2 de marzo (mes empieza en 0)
const diasRestantes = Math.ceil(
  (fechaSorteo - hoy) / (1000 * 60 * 60 * 24)
);

if (btnAgendar) {
  if (diasRestantes <= 0) {
    btnAgendar.innerHTML = "🎉 ¡HOY ES EL SORTEO!";
    btnAgendar.style.backgroundColor = "#6e281c";
  } else if (diasRestantes <= 3) {
    btnAgendar.innerHTML = `🔥 Últimos ${diasRestantes} días`;
    btnAgendar.style.backgroundColor = "#f59e0b";
  } else if (diasRestantes <= 7) {
    btnAgendar.innerHTML = "🗓️ Falta poco para el sorteo";
  }
}
  btnAgendar?.addEventListener("click", () => {
  const url =
    "https://www.google.com/calendar/render?action=TEMPLATE" +
    "&text=Sorteo+Rifa+Solidaria" +
    "&dates=20260302/20260303" +
    "&details=Sorteo+rifa+beneficio+operación+LCA";

  window.open(url, "_blank");
});

});



