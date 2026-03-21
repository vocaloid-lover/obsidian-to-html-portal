document.addEventListener("DOMContentLoaded", function () {
  const yearNode = document.getElementById("copyright-year");

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
});
