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


    validateOptions.forEach((option) => {
        if (input.hasAttribute(option.attribute) && !option.isValid(input)) {
            errorContainer.textContent = option.errorMessage(input);
            formGroupError = true;
        }
    });


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
        attribute: "required",
        isValid: (input) => {
            if (input.type === "file") {
                return !input.hasAttribute("required") || input.files.length > 0;
            }
            return input.value.trim() !== "";
        },
        errorMessage: (input) => `${input.name} is required`,
    },
    {
        attribute: "minlength",
        isValid: (input) => input.value.length >= parseInt(input.minLength, 10),
        errorMessage: (input) => `${input.name} must be at least ${input.minLength} characters`,
    },
    {
        attribute: "custommaxlength",
        isValid: (input) => input.value.length <= parseInt(input.getAttribute("custommaxlength"), 10),
        errorMessage: (input) => `${input.name} must be less than ${input.getAttribute("custommaxlength")} characters`,
    },
    {
        attribute: "pattern",
        isValid: (input) => new RegExp(input.pattern).test(input.value),
        errorMessage: (input) => `${input.name} should match the required format`,
    },
    {
        attribute: "match",
        isValid: (input) => {
            const matchInput = document.querySelector(`#${input.getAttribute("match")}`);
            return matchInput && matchInput.value.trim() === input.value.trim();
        },
        errorMessage: (input) => `${input.name} must match ${input.getAttribute("match")}`,
    },
    {
        attribute: "required-radio",
        isValid: (input) => Array.from(document.querySelectorAll(`input[name="${input.name}"]`)).some((btn) => btn.checked),
        errorMessage: (input) => `Please select a ${input.name}`,
    },
    {
        attribute: "required-checkbox",
        isValid: (input) => input.checked,
        errorMessage: () => "Please agree to the terms",
    },
// validation for image or files
    {
        attribute: "accept",
        isValid: (input) => {
            if (input.type !== "file") return true;
            if (!input.files.length) return true; 
            const file = input.files[0];
            const allowedTypes = input.accept.split(",").map((type) => type.trim());
            return allowedTypes.includes(file.type);
        },
        errorMessage: (input) => {
            const allowedTypes = input.accept.split(",").join(", ");
            return `Please upload a valid file of type: ${allowedTypes}`;
        },
    },
    {
        attribute: "maxsize",
        isValid: (input) => {
            if (input.type !== "file") return true;
            if (!input.files.length) return true; 
            const file = input.files[0];
            const maxSize = parseInt(input.getAttribute("maxsize"), 10);
            return file.size <= maxSize;
        },
        errorMessage: (input) => 
            `File size must not exceed ${(parseInt(input.getAttribute("maxsize"), 10) / 1024 / 1024).toFixed(2)} MB`,
    }
];

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
                formData[input.name] = input.value;
            }
        } else {
            formData[input.name] = input.value;
        }
    });
    console.log("FormData to be sent:", formData);

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
            displayFormData(Object.fromEntries(formData.entries()));
            console.log(
                "Submitting form data:",
                Object.fromEntries(formData.entries())
            );

            try {
                const response = await fetch(
                    `${API_BASE_URL}/bookAppointment`,
                    {
                        method: "POST",
                        body: formData, 
                    }
                );

                if (response.ok) {
                    alert(
                        " ✅ Appointment Booked Successfully, You Will Recieve A Confirmation Email Shortly"
                    );
                    formElement.reset();
                    window.location.href = `${API_BASE_URL}/patientDashboard`;
                } else {
                    const data = await response.json();
                    alert(data.error || "Registration failed");
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

