/**
 * Urban Threads — Contact Page Controller
 */
(function () {
  "use strict";
  function init() {
    const form = document.getElementById("contact-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      UT_Toast.show({ type: "success", title: "Message sent", message: "We'll get back to you within 24 hours." });
      form.reset();
    });

    document.querySelectorAll(".faq-item .accordion-trigger").forEach((btn) => {
      btn.addEventListener("click", () => btn.closest(".faq-item").classList.toggle("open"));
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
