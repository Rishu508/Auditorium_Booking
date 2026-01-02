const googlebutton = document.querySelector(".googlebtn");
const form = document.querySelector("form");

// This function is used for showing the toast message
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
    email: form.querySelector("#email").value,
    password: form.querySelector("#password").value,
  };

  try {
    const res = await fetch(`${window._env_.BACKEND_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(FormData),
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Login Successful");
      if (data.user.role == "admin") {
        window.location.href = "../pages/adminPanel.html";
      } else {
        window.location.href = "../index.html";
      }
    } else {
      showToast(data.message || "Login failed. Please try again!");
    }
  } catch (error) {
    console.log(error);
  }
});

googlebutton.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = `${window._env_.BACKEND_URL}/api/auth/google`;
});
