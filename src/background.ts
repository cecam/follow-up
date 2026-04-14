// src/background.ts

chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "¡Hola Mundo! El Service Worker de la extensión se ha instalado.",
  );
});

// Ejemplo: Escuchar cuando se hace clic en el icono de la extensión
chrome.action.onClicked.addListener((tab) => {
  console.log(
    "Se hizo clic en el icono de la extensión en la pestaña:",
    tab.id,
  );
});
