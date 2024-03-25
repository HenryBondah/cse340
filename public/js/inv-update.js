const form = document.querySelector("#updateForm");
form.addEventListener("change", function () {
    const updateBtn = document.querySelector("button[type='submit']");
    updateBtn.removeAttribute("disabled");
    console.log("Form changed, button should be enabled."); // Debugging
});
