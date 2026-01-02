const googlebutton = document.querySelector(".googlebtn");
const form = document.querySelector("form");

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000); // hide in 3 seconds
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let FormData = {
    Firstname: form.querySelector("#fname").value,
    Lastname: form.querySelector("#lname").value,
    email: form.querySelector("#email").value,
    password: form.querySelector("#password").value,
  };

  try {
    const res = await fetch(`${window._env_.BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(FormData),
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Account Created.");
      localStorage.setItem("email", FormData.email);
      setTimeout(() => {
        window.location.href = "../pages/email-verify-popup.html";
      }, 2000);
      form.reset();
    } else {
      showToast(data.message || "Signup failed");
    }
  } catch (error) {
    console.log(error);
  }
});

googlebutton.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = `${window._env_.BACKEND_URL}/api/auth/google`;
});
