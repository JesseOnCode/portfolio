const FIELD_LIMITS = {
  name: 80,
  email: 254,
  message: 2000
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBMIT_COOLDOWN_MS = 8000;

function initMenu() {
  const menuIcon = document.querySelector("#menu-icon");
  const navbar = document.querySelector(".navbar");

  if (!menuIcon || !navbar) {
    return;
  }

  const closeMenu = () => {
    menuIcon.classList.remove("is-open");
    navbar.classList.remove("active");
    menuIcon.setAttribute("aria-expanded", "false");
    menuIcon.setAttribute("aria-label", "Avaa valikko");
  };

  menuIcon.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("active");
    menuIcon.classList.toggle("is-open", isOpen);
    menuIcon.setAttribute("aria-expanded", String(isOpen));
    menuIcon.setAttribute("aria-label", isOpen ? "Sulje valikko" : "Avaa valikko");
  });

  navbar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

function getTrimmedValue(formData, field) {
  return String(formData.get(field) || "").trim();
}

function getCaptchaToken(form) {
  const field = form.querySelector('textarea[name="h-captcha-response"]');
  return field ? field.value.trim() : "";
}

function resetCaptcha() {
  if (typeof hcaptcha !== "undefined") {
    hcaptcha.reset();
  }
}

function initContactForm() {
  const form = document.getElementById("contact-form-element");
  const formMessage = document.getElementById("form-message");

  if (!form || !formMessage) {
    return;
  }

  const showMessage = (text, type) => {
    formMessage.textContent = text;
    formMessage.className = `${type} is-visible`;
  };

  const hideMessage = () => {
    formMessage.textContent = "";
    formMessage.className = "";
  };

  let lastSubmitAt = 0;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const name = getTrimmedValue(formData, "name");
    const email = getTrimmedValue(formData, "email");
    const message = getTrimmedValue(formData, "message");
    const captchaToken = getCaptchaToken(form);
    const now = Date.now();

    if (formData.get("botcheck")) {
      showMessage("Jokin meni pieleen. Yritä uudelleen.", "error");
      return;
    }

    if (name.length < 2 || name.length > FIELD_LIMITS.name) {
      showMessage("Kirjoita nimi (2–80 merkkiä).", "error");
      return;
    }

    if (!EMAIL_PATTERN.test(email) || email.length > FIELD_LIMITS.email) {
      showMessage("Kirjoita kelvollinen sähköpostiosoite.", "error");
      return;
    }

    if (!message || message.length > FIELD_LIMITS.message) {
      showMessage("Kirjoita viesti (enintään 2000 merkkiä).", "error");
      return;
    }

    if (now - lastSubmitAt < SUBMIT_COOLDOWN_MS) {
      showMessage("Odota hetki ennen uutta lähetystä.", "error");
      return;
    }

    if (!captchaToken) {
      showMessage("Vahvista, ettet ole robotti.", "error");
      return;
    }

    formData.set("name", name);
    formData.set("email", email);
    formData.set("message", message);
    formData.set("subject", "Uusi viesti portfoliosta");
    formData.set("from_name", "Jesse Portfolio");
    formData.set("h-captcha-response", captchaToken);

    submitButton.textContent = "Lähetetään...";
    submitButton.disabled = true;

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData
      });

      const data = await response.json();
      const apiMessage = data.message || data.body?.message || "";

      if (data.success) {
        lastSubmitAt = now;
        showMessage("Kiitos viestistäsi! Otan yhteyttä sinuun pian.", "success");
        form.reset();
        resetCaptcha();
        setTimeout(hideMessage, 5000);
      } else if (/captcha/i.test(apiMessage)) {
        showMessage("Vahvista captcha ja yritä uudelleen.", "error");
        resetCaptcha();
      } else {
        showMessage("Jokin meni pieleen. Yritä uudelleen.", "error");
        resetCaptcha();
      }
    } catch {
      showMessage("Yhteysongelma. Tarkista verkko ja yritä uudelleen.", "error");
      resetCaptcha();
    }

    submitButton.textContent = "Lähetä viesti";
    submitButton.disabled = false;
  });
}

function startTyped(element, strings) {
  let stringIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const current = strings[stringIndex];

    if (!deleting) {
      charIndex += 1;
      element.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        if (strings.length === 1) {
          return;
        }

        deleting = true;
        setTimeout(tick, 1000);
        return;
      }

      setTimeout(tick, 100);
      return;
    }

    charIndex -= 1;
    element.textContent = current.slice(0, charIndex);

    if (charIndex === 0) {
      deleting = false;
      stringIndex = (stringIndex + 1) % strings.length;
      setTimeout(tick, 200);
      return;
    }

    setTimeout(tick, 100);
  };

  tick();
}

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initContactForm();

  const typedElement = document.getElementById("typed");
  if (typedElement) {
    startTyped(typedElement, ["ohjelmistokehittäjä", "opiskelija"]);
  }
});
