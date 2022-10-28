const normalizr = require("normalizr");
const normalize = normalizr.normalize;
const denormalize = normalizr.denormalize;
const schema = normalizr.schema;

const express = require('express');
const app = express();

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

let admin = require("firebase-admin");

let serviceAccount = require("./configFirebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let mensajesApi = []

const traerMensajes = async () => {
  const db = admin.firestore();
  const mensajesDB = db.collection("mensajes");
  try {
    const userSnapshot = await mensajesDB.get()
    const mensajeDoc = userSnapshot.docs

    let response = mensajeDoc.map(mj => ({
      id: mj.id,
      author: mj.data().author,
      text: mj.data().text
    }))

    mensajesApi = response
    console.log("mensajes traidos de FireBase", mensajesApi)

  } catch (err) {
    console.log(err);
  }
}

app.listen(3000, () => {
  console.log('Escuchando el puerto 3000');
});

const util = require('util')
function print(objeto) {
  console.log(util.inspect(objeto, false, 12, true))
}

const author = new schema.Entity("author", {}, { idAttribute: "id" });
const mensaje = new schema.Entity(
  "mensaje",
  { author: author },
  { idAttribute: "id" }
);

const schemaMensajes = new schema.Entity(
  "mensajes",
  {
    mensajes: [mensaje],
  },
  { idAttribute: "id" }
);
const normalizarMensajes = (mensajesConId) => normalize(mensajesConId, schemaMensajes);
let normalizados = []
async function listarMensajesNormalizados() {
  await traerMensajes()
  const mensajes = mensajesApi
  normalizados = normalizarMensajes({ id: 'mensajes', mensajes })
  print(normalizados)

  //  Optimizaciòn

  const logitudNormalized = JSON.stringify(normalizados).length;
  const longitudOriginal = JSON.stringify(mensajesApi).length;

  console.log("Longitud original: ", longitudOriginal);
  console.log("Longitud normalizado: ", logitudNormalized);

  const porcentaje = (logitudNormalized * 100) / longitudOriginal;

  console.log(`Porcentaje de optimizacion ${(100 - porcentaje).toFixed(2)}%`);
  
  return normalizados
}

listarMensajesNormalizados()