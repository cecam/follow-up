function helloWorld() {
  const h1 = document.querySelector("h1");

  if (!h1) return;

  if (h1.dataset.helloInjected === "true") return;

  const span = document.createElement("span");
  span.textContent = "Hello fucking world";
  span.style.color = "red";
  span.style.fontSize = "20px";
  span.style.fontWeight = "bold";
  span.style.textAlign = "center";
  span.style.textTransform = "uppercase";
  span.style.textDecoration = "underline";
  span.style.textShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  span.style.textOverflow = "ellipsis";
  span.style.whiteSpace = "nowrap";

  h1.appendChild(span);
  h1.dataset.helloInjected = "true";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", helloWorld);
} else {
  helloWorld();
}
