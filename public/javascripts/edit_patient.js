// Validation functions
const validateSingleFormGroup = (formGroup) => {
    const errorContainer = formGroup.querySelector(".error");
    const errorIcon = formGroup.querySelector(".error-icon");
    const successIcon = formGroup.querySelector(".success-icon");
    const input = formGroup.querySelector("input, textarea, select");

    let formGroupError = false;

    // Dropdown validation
    if (input.tagName === "SELECT" && input.value === "Select") {
        errorContainer.textContent = `Please select your ${input.name}`;
        formGroupError = true;
    } else if (input.tagName === "SELECT" && input.value !== "Select") {
        errorContainer.textContent = "";
        formGroupError = false;
    }

    // Radio button validation
    if (input.type === "radio") {
        const radioGroup = document.querySelectorAll(
            `input[name="${input.name}"]`
        );
        const checkedRadio = Array.from(radioGroup).find((btn) => btn.checked);
        if (!checkedRadio) {
            errorContainer.textContent = `Please select a ${input.name}`;
            formGroupError = true;
        } else {
            errorContainer.textContent = "";
            formGroupError = false;
        }
    }

    /*     // Image upload validation
    if (input.type === "file") {
        // Specific validation for file inputs
        const file = input.files[0];
        if (!file) {
            errorContainer.textContent = `${input.name} is required`;
            formGroupError = true;
        } else {
            validateOptions.forEach((option) => {
                if (
                    input.hasAttribute(option.attribute) &&
                    !option.isValid(input)
                ) {
                    errorContainer.textContent = option.errorMessage(input);
                    formGroupError = true;
                }
            });
        }
    } else {
        // Existing validation logic
        validateOptions.forEach((option) => {
            if (
                input.hasAttribute(option.attribute) &&
                !option.isValid(input)
            ) {
                errorContainer.textContent = option.errorMessage(input);
                formGroupError = true;
            }
        });
    } */

    validateOptions.forEach((option) => {
        if (input.hasAttribute(option.attribute) && !option.isValid(input)) {
            errorContainer.textContent = option.errorMessage(input);
            formGroupError = true;
        }
    });

    // Loop through validation options
    /*     validateOptions.forEach((option) => {
        if (input.hasAttribute(option.attribute) && !option.isValid(input)) {
            errorContainer.textContent = option.errorMessage(input);
            formGroupError = true;
        }
    }); */

    // Toggle error/success state
    if (formGroupError) {
        input.classList.add("form__input--error");
        input.classList.remove("form__input--success");
        errorIcon.classList.remove("hidden");
        successIcon.classList.add("hidden");
    } else {
        errorContainer.textContent = "";
        input.classList.add("form__input--success");
        input.classList.remove("form__input--error");
        errorIcon.classList.add("hidden");
        successIcon.classList.remove("hidden");
    }
};

const validateAllFormGroups = (formToValidate) => {
    const formGroups = Array.from(formToValidate.querySelectorAll(".form_val"));
    formGroups.forEach(validateSingleFormGroup);
};

// Validation logic
const validateOptions = [
    {
        attribute: "minlength",
        isValid: (input) => input.value.length >= parseInt(input.minLength, 10),
        errorMessage: (input) =>
            `${input.name} must be at least ${input.minLength} characters`,
    },
    {
        attribute: "custommaxlength",
        isValid: (input) =>
            input.value.length <=
            parseInt(input.getAttribute("custommaxlength"), 10),
        errorMessage: (input) =>
            `${input.name} must be less than ${input.getAttribute(
                "custommaxlength"
            )} characters`,
    },
    {
        attribute: "pattern",
        isValid: (input) => new RegExp(input.pattern).test(input.value),
        errorMessage: (input) =>
            `${input.name} should match the required format`,
    },
    // {
    //     attribute: "minage",
    //     isValid: (input) => input.value >= 18 && input.value <= 100,
    //     errorMessage: () => "Age must be between 18 and 100",
    // },
    {
        attribute: "match",
        isValid: (input) => {
            const matchInput = document.querySelector(
                `#${input.getAttribute("match")}`
            );
            return matchInput && matchInput.value.trim() === input.value.trim();
        },
        errorMessage: (input) =>
            `${input.name} must match ${input.getAttribute("match")}`,
    },
    {
        attribute: "required",
        isValid: (input) => input.value.trim() !== "",
        errorMessage: (input) => `${input.name} is required`,
    },
    {
        attribute: "required-radio",
        isValid: (input) =>
            Array.from(
                document.querySelectorAll(`input[name="${input.name}"]`)
            ).some((btn) => btn.checked),
        errorMessage: (input) => `Please select a ${input.name}`,
    },
    {
        attribute: "required-checkbox",
        isValid: (input) => input.checked,
        errorMessage: () => "Please agree to the terms",
    },
];

/* validateOptions.push({
    attribute: "accept", // Use the 'accept' attribute to define acceptable file types
    isValid: (input) => {
        if (input.type !== "file") return true; // Skip non-file inputs
        const file = input.files[0];
        if (!file) return false; // No file selected
        const allowedTypes = input.accept.split(",").map((type) => type.trim());
        return allowedTypes.includes(file.type);
    },
    errorMessage: (input) => {
        const allowedTypes = input.accept.split(",").join(", ");
        return `Please upload a valid file of type: ${allowedTypes}`;
    },
}); */

/* validateOptions.push({
    attribute: "maxsize", // Custom attribute for maximum file size
    isValid: (input) => {
        if (input.type !== "file") return true; // Skip non-file inputs
        const file = input.files[0];
        if (!file) return false; // No file selected
        const maxSize = parseInt(input.getAttribute("maxsize"), 10);
        return file.size <= maxSize;
    },
    errorMessage: (input) =>
        `File size must not exceed ${(
            parseInt(input.getAttribute("maxsize"), 10) /
            1024 /
            1024
        ).toFixed(2)} MB`,
}); */
validateOptions.push({
    attribute: "required",
    isValid: (input) => {
        // Check if it's a file input and whether it's required
        if (input.type === "file" && input.hasAttribute("required")) {
            return input.files.length > 0;
        }
        // For non-file inputs, proceed with the usual required check
        return input.value.trim() !== "";
    },
    errorMessage: (input) => `${input.name} is required`,
});

// Form data handling functions
const captureFormData = (form) => {
    const formData = {};
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
        if (input.type === "radio") {
            const radioGroup = document.querySelectorAll(
                `input[name="${input.name}"]`
            );
            const checkedRadio = Array.from(radioGroup).find(
                (btn) => btn.checked
            );
            if (checkedRadio) {
                formData[input.name] = checkedRadio.value;
            }
        } else if (input.type === "checkbox") {
            if (input.checked) {
                // formData[input.name] = input.value;
                formData[input.name] = input.value;
            }
        } else {
            formData[input.name] = input.value;
        }
    });
    console.log("FormData to be sent:", formData);
    // console.log("Fetch response:", data);

    return formData;
};

const displayFormData = (formData) => {
    const summarySection = document.querySelector("#formSummary");
    if (!summarySection) {
        console.error("Form summary section not found");
        return;
    }

    let summaryHTML = "<h2>Form Summary</h2>";
    Object.entries(formData).forEach(([key, value]) => {
        summaryHTML += `<p><strong>${key}:</strong> ${value}</p>`;
    });

    summarySection.innerHTML = summaryHTML;
};

const updateSubmitButton = (isSuccess) => {
    const submitButton = document.querySelector('button[type="submit"]');
    if (!submitButton) return;

    const originalText = submitButton.textContent;
    const originalColor = submitButton.style.backgroundColor;

    if (isSuccess) {
        submitButton.textContent = "Success";
        submitButton.style.backgroundColor = "green";
    } else {
        submitButton.textContent = "Failed";
        submitButton.style.backgroundColor = "red";
    }

    setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.style.backgroundColor = originalColor;
    }, 2000);
};

// Main form validation and handling function
const enhancedValidateForm = (formSelector) => {
    const formElement = document.querySelector(formSelector);
    formElement.setAttribute("novalidate", "");

    // Blur event validation
    formElement.addEventListener(
        "blur",
        (event) => {
            const formGroup = event.target.closest(".form_val");
            if (formGroup) validateSingleFormGroup(formGroup);
        },
        true
    );

    // Real-time validation and summary update
    formElement.addEventListener("input", (event) => {
        const formGroup = event.target.closest(".form_val");
        if (formGroup) {
            validateSingleFormGroup(formGroup);
        }
        const currentFormData = captureFormData(formElement);
        displayFormData(currentFormData);
    });

    // Submit event validation

    formElement.addEventListener("submit", async (event) => {
        event.preventDefault();
        validateAllFormGroups(formElement);

        const allValid = !Array.from(
            formElement.querySelectorAll(".form_val")
        ).some((formGroup) =>
            formGroup.querySelector(".error").textContent.trim()
        );

        if (allValid) {
            const formData = new FormData(formElement);

            // Debug log to see what's being sent
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }

            displayFormData(Object.fromEntries(formData.entries()));

            // Get the form's action URL directly from the form element
            const formAction = formElement.getAttribute("action");

            try {
                // Convert FormData to JSON if your API expects JSON
                const formDataObject = Object.fromEntries(formData.entries());

                const response = await fetch(formAction, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formDataObject),
                    // body: formData.toString(),
                });

                // Log the response for debugging
                const responseData = await response.json();
                console.log("Server response:", responseData);

                if (response.ok) {
                    alert("Profile Editted Successfully");
                    formElement.reset();
                    window.location.href = "/patientDashboard";
                } else {
                    alert(responseData.error || "Registration failed");
                }
            } catch (error) {
                alert("An error occurred while submitting the form");
                console.error("Error during fetch:", error);
            }
        } else {
            updateSubmitButton(false);
            console.error("Form validation failed.");
        }
    });
};

// Label animation for form inputs
const handleLabelAnimation = () => {
    document.querySelectorAll(".form__input-anim").forEach((input, index) => {
        const label = document.querySelectorAll(".form__label-anim")[index];
        label.classList.add("hide");

        input.addEventListener("input", () => {
            label.classList.toggle("hide", !input.value.trim());
        });
    });
};

// Initialize the form validation and handling
enhancedValidateForm("#registrationForm");
handleLabelAnimation();
