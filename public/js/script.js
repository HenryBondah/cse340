function togglePassword() {
  var password = document.getElementById("account_password");
  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

  function togglePasswordVisibility(passwordId) {
    var password = document.getElementById(passwordId);
    if (password) { // Ensure the element exists
      password.type = password.type === "password" ? "text" : "password";
    }
  }
