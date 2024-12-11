const validateSingleFormGroup = (formGroup) => {
    const errorContainer = formGroup.querySelector(".error");
    const errorIcon = formGroup.querySelector(".error-icon");
    const successIcon = formGroup.querySelector(".success-icon");
    const label = formGroup.querySelector("label");
    const input = formGroup.querySelector("input, textarea");

    let formGroupError = false;

    // Loop through validation options
    for (const option of validateOptions) {
        if (input.hasAttribute(option.attribute) && !option.isValid(input)) {
            // Show error and hide success
            errorContainer.textContent = option.errorMessage(input, label);
            input.classList.add("form__input--error");
            input.classList.remove("form__input--success");
            successIcon.classList.add("hidden");
            errorIcon.classList.remove("hidden");

            formGroupError = true;
        }
    }

    // If no error, show success and hide error
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

    {
        attribute: "required-checkbox",
        isValid: (input) => input.checked,
        errorMessage: (input) => "Please agree to the terms",
    },
];

// Main function to initialize form validation
const validateForm = (formSelector) => {
    const formElement = document.querySelector(formSelector);

    formElement.setAttribute("novalidate", "");

    Array.from(formElement.elements).forEach((element) =>
        element.addEventListener("blur", (event) => {
            validateSingleFormGroup(event.target.closest(".form_val"));
        })
    );

    formElement.addEventListener("submit", (event) => {
        event.preventDefault();
        validateAllFormGroups(formElement);

        // Check if all form groups are valid
        const formGroups = Array.from(
            formElement.querySelectorAll(".form_val")
        );
        const allValid = !formGroups.some((formGroup) =>
            formGroup.querySelector(".error").textContent.trim()
        );

        if (allValid) {
            // Submit the form
            formElement.submit();
        }
    });
};

validateForm("#registrationForm");

// For Label Animation
const inputAnimations = document.querySelectorAll(".form__input-anim");
const labels = document.querySelectorAll(".form__label-anim");

// Add the hidden class to the labels by default
labels.forEach((labeling) => {
    labeling.classList.add("hide");
});

inputAnimations.forEach((inputAnimation, index) => {
    inputAnimation.addEventListener("input", () => {
        if (
            inputAnimation.value ||
            inputAnimation.placeholder !==
                inputAnimation.getAttribute("placeholder")
        ) {
            labels[index].classList.remove("hide");
        } else {
            labels[index].classList.add("hide");
        }
    });
});
