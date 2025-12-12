

// Generate password based on user criteria
function generate_password(length = 12, use_uppercase = true, use_numbers = true, use_special_chars = true) {
    if (length < 4) {
        throw new Error("Lösenordet måste vara minst 4 tecken långt.");
    }
    let pool = "abcdefghijklmnopqrstuvwxyz";
    let char_types = [];
    if (use_uppercase) {
        pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        char_types.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    }
    if (use_numbers) {
        pool += "0123456789";
        char_types.push("0123456789");
    }
    if (use_special_chars) {
        pool += "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
        char_types.push("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~");
    }

    // Helper for secure random choice
    function secureChoice(str) {
        const arrayLen = str.length;
        const randomBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(randomBuffer);
        return str[randomBuffer[0] % arrayLen];
    }

    // Ensure at least one of each selected type
    let password_chars = [];
    for (let t of char_types) {
        password_chars.push(secureChoice(t));
    }
    // Fill the rest
    for (let i = password_chars.length; i < length; i++) {
        password_chars.push(secureChoice(pool));
    }
    // Shuffle the password characters
    for (let i = password_chars.length - 1; i > 0; i--) {
        const j = Math.floor(window.crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * (i + 1));
        [password_chars[i], password_chars[j]] = [password_chars[j], password_chars[i]];
    }
    return password_chars.join("");
}

// Analyze password strength and score it
function rate_password_strength(password) {
    const length = password.length;
    const has_upper = /[A-Z]/.test(password);
    const has_lower = /[a-z]/.test(password);
    const has_digit = /\d/.test(password);
    const has_special = /[!\"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(password);

    let score = 0;
    if (length >= 16) {
        score += 3;
    } else if (length >= 12) {
        score += 2;
    } else if (length >= 8) {
        score += 1;
    }
    if (has_upper) {
        score += 2;
    }
    if (has_lower) {
        score += 2;
    }
    if (has_digit) {
        score += 2;
    }
    if (has_special) {
        score += 2;
    }

    if (score >= 11) {
        return "Väldigt starkt";
    } else if (score >= 10) {
        return "Starkt";
    } else if (score >= 7) {
        return "Medel";
    } else {
        return "Svagt";
    }
}

// Copy to clipboard functionality
function add_password_to_clipboard(password) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(password);
    }
}

// DOM interaction
document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".password-generator");
    if (!container) return;

    const lengthInput = container.querySelector(".password-length");
    const uppercaseInput = container.querySelector(".include-uppercase");
    const numbersInput = container.querySelector(".include-numbers");
    const specialCharsInput = container.querySelector(".include-special-chars");
    const generateBtn = container.querySelector(".button-generate-password");
    const passwordDisplay = container.querySelector(".generated-password-display");

    // Add strength display if not present
    let strengthDisplay = container.querySelector(".password-strength-display");
    if (!strengthDisplay) {
        strengthDisplay = document.createElement("p");
        strengthDisplay.className = "password-strength-display";
        strengthDisplay.style.marginTop = "8px";
        passwordDisplay.insertAdjacentElement("afterend", strengthDisplay);
    }

    // Add copy button if not present
    let copyBtn = container.querySelector(".button-copy-password");
    if (!copyBtn) {
        copyBtn = document.createElement("button");
        copyBtn.className = "button-copy-password";
        copyBtn.textContent = "Kopiera";
        passwordDisplay.insertAdjacentElement("afterend", copyBtn);
    }

    function updatePassword() {
        const length = parseInt(lengthInput.value, 10);
        const useUppercase = uppercaseInput.checked;
        const useNumbers = numbersInput.checked;
        const useSpecial = specialCharsInput.checked;
        let password = "";
        let strength = "";
        try {
            password = generate_password(length, useUppercase, useNumbers, useSpecial);
            strength = rate_password_strength(password);
            passwordDisplay.textContent = password;
            strengthDisplay.textContent = `Styrka: ${strength}`;
        } catch (e) {
            passwordDisplay.textContent = e.message;
            strengthDisplay.textContent = "";
        }
    }

    generateBtn.addEventListener("click", updatePassword);

    copyBtn.addEventListener("click", async function () {
        const password = passwordDisplay.textContent.trim();
        if (
            password &&
            password !== "Ditt genererade lösenord visas här" &&
            !password.includes("Lösenordet måste vara minst")
        ) {
            let copied = false;
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(password);
                    copied = true;
                } catch (err) {
                    console.error("Clipboard copy failed:", err);
                }
            }
            // Fallback for older browsers or insecure context
            if (!copied) {
                try {
                    const textarea = document.createElement("textarea");
                    textarea.value = password;
                    textarea.style.position = "fixed";
                    textarea.style.left = "-9999px";
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    const successful = document.execCommand("copy");
                    document.body.removeChild(textarea);
                    if (successful) {
                        copied = true;
                    }
                } catch (err) {
                    console.error("Fallback clipboard copy failed:", err);
                }
            }
            if (copied) {
                copyBtn.textContent = "Kopierat!";
            } else {
                copyBtn.textContent = "Fel vid kopiering!";
            }
            setTimeout(() => {
                copyBtn.textContent = "Kopiera";
            }, 1500);
        }
    });
});
