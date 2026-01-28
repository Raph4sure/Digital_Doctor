export const successfulProgress = (message, callback) => {
    const toast = document.createElement("div");
    toast.className = "succesful-container";
    toast.innerHTML = `
    <div className="succesful-container">
        <span style="margin-right">✅</span>
        <span>${message}</span>
        <button class='succesful-close'>&times;</button>
    </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);

    const closeBtn = toast.querySelector(".succesful-close");
    closeBtn.addEventListener("click", () => {
        toast.remove();
    });

    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.style.opacity = "0";
            toast.style.transition = "opacity 0.5s ease";

            setTimeout(() => {
                toast.remove();
                if (callback) callback();
            }, 500);
        }
    }, 3000);
};
