function togglePassword() {
    var x = document.getElementById("password");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  function togglePasswordVisibility(passwordId, confirmPasswordId) {
    var password = document.getElementById(passwordId);
    var confirmPassword = document.getElementById(confirmPasswordId);
    if (password && confirmPassword) { // Ensure elements exist
      [password, confirmPassword].forEach(function(e) {
        e.type = e.type === "password" ? "text" : "password";
      });
    }
  }