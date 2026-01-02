const Forgotpassword = document.querySelector("#Forgotpassword");

Forgotpassword.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const email = form.querySelector("#email").value;

    if (!email) {
      alert("Email is Required");
    }

    const response = await fetch(
      `${window._env_.BACKEND_URL}/api/auth/forgot-Password`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.log(error);
  }
});
