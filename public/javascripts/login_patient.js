const validateSingleFormGroup = (formGroup) => {
    const errorContainer = formGroup.querySelector(".error");
    const errorIcon = formGroup.querySelector(".error-icon");
    const successIcon = formGroup.querySelector(".success-icon");
    const label = formGroup.querySelector("label");
    const input = formGroup.querySelector("input, textarea");

    let formGroupError = false;

    for (const option of validateOptions) {
        if (input.hasAttribute(option.attribute) && !option.isValid(input)) {
            errorContainer.textContent = option.errorMessage(input, label);
            input.classList.add("form__input--error");
            input.classList.remove("form__input--success");
            successIcon.classList.add("hidden");
            errorIcon.classList.remove("hidden");
            formGroupError = true;
            break;
        }
    }

    if (!formGroupError) {
        errorContainer.textContent = "";
        input.classList.add("form__input--success");
        input.classList.remove("form__input--error");
        errorIcon.classList.add("hidden");
        successIcon.classList.remove("hidden");
    }
};

const validateAllFormGroups = (formToValidate) => {
    const formGroups = Array.from(formToValidate.querySelectorAll(".form_val"));

    formGroups.forEach((formGroup) => {
        validateSingleFormGroup(formGroup);
    });
};

const validateOptions = [
    {
        attribute: "minlength",
        isValid: (input) =>
            input.value && input.value.length >= parseInt(input.minLength, 10),
        errorMessage: (input, label) =>
            `${label.textContent} needs to be at least ${input.minLength} characters`,
    },

    {
        attribute: "custommaxlength",
        isValid: (input) =>
            input.value &&
            input.value.length <=
                parseInt(input.getAttribute("custommaxlength"), 10),
        errorMessage: (input, label) =>
            `${label.textContent} needs to be less than ${input.getAttribute(
                "custommaxlength"
            )} characters`,
    },

    {
        attribute: "pattern",
        isValid: (input) => {
            const patternRegex = new RegExp(input.pattern);
            return patternRegex.test(input.value);
        },
        errorMessage: (input, label) =>
            `${label.textContent} should be a valid format`,
    },
    {
        attribute: "match",
        isValid: (input) => {
            const matchSelector = input.getAttribute("match");
            const matchedElem = document.querySelector(`#${matchSelector}`);
            return (
                matchedElem && matchedElem.value.trim() === input.value.trim()
            );
        },
        errorMessage: (input, label) => {
            const matchSelector = input.getAttribute("match");
            const matchedElem = document.querySelector(`#${matchSelector}`);
            const matchedLabel =
                matchedElem.parentElement.querySelector("label");
            return `${label.textContent} should match ${matchedLabel.textContent}`;
        },
    },
    {
        attribute: "required",
        isValid: (input) => input.value.trim() !== "",
        errorMessage: (input, label) => `${label.textContent} is required`,
    },
];

const validateForm = (formSelector) => {
    const formElement = document.querySelector(formSelector);

    formElement.setAttribute("novalidate", "");

    Array.from(formElement.elements).forEach((element) =>
        element.addEventListener("blur", (event) => {
            validateSingleFormGroup(event.target.closest(".form_val"));
        })
    );

    formElement.addEventListener("submit", async (event) => {
        event.preventDefault();
        validateAllFormGroups(formElement);

        const formGroups = Array.from(
            formElement.querySelectorAll(".form_val")
        );
        const allValid = !formGroups.some((formGroup) =>
            formGroup.querySelector(".error").textContent.trim()
        );

        if (!allValid) return;

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(
                "http://localhost:3300/loginPatient",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                }
            );

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                window.location.href = "http://localhost:3300/patientDashboard";

                // redirect to the dashboard page
            } else {
                if (result.error.includes("email")) {
                    const emailError = document
                        .querySelector("#email")
                        .closest(".form_val")
                        .querySelector(".error");
                    emailError.textContent = result.error;
                } else if (result.error.includes("password")) {
                    const passwordError = document
                        .querySelector("#password")
                        .closest(".form_val")
                        .querySelector(".error");
                    passwordError.textContent = result.error;
                }
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again later.");
        }
    });
};

validateForm("#loginForm");

// Label Animation
const inputAnimations = document.querySelectorAll(".form__input-anim");
const labels = document.querySelectorAll(".form__label-anim");

labels.forEach((label) => label.classList.add("hide"));

inputAnimations.forEach((input, index) => {
    input.addEventListener("input", () => {
        if (input.value) {
            labels[index].classList.remove("hide");
        } else {
            labels[index].classList.add("hide");
        }
    });
});
