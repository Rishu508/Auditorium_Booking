const useremail = document.querySelector(".user-email");
const resendemailbtn = document.querySelector(".btn-primary");
const closebtn = document.querySelector(".btn-secondary");
const overlay = document.querySelector(".verify-overlay");

const email = localStorage.getItem("email");

if (email) {
  useremail.textContent = email;
} else {
  useremail.textContent = "youremail@example.com";
}

resendemailbtn.addEventListener("click", async () => {
  if (!email) {
    alert("Email not found. Please signup again.");
    return;
  }

  resendemailbtn.disabled = true;
  resendemailbtn.textContent = "Sending...";

  try {
    const response = await fetch(
      `${window._env_.BACKEND_URL}/api/auth/resendemail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Server error. Try again later.");
  } finally {
    resendemailbtn.disabled = false;
    resendemailbtn.textContent = "Resend Email";
  }
});

closebtn.addEventListener("click", () => {
  overlay.classList.add("hide");

  // Optional: actually remove from DOM after transition
  setTimeout(() => {
    // redirect or do other stuff
    window.location.href = "../landingpg.html";
  }, 400); // match transition duration
});
