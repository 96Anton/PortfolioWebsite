
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

    copyBtn.addEventListener("click", function () {
        const password = passwordDisplay.textContent;
        if (password && !password.includes("Lösenordet måste vara minst")) {
            add_password_to_clipboard(password);
            copyBtn.textContent = "Kopierat!";
            setTimeout(() => {
                copyBtn.textContent = "Kopiera";
            }, 1200);
        }
    });
});




/* ORIGINAL CODE IN PYTHON BELOW (I translated it to JavaScript when I was happy with the program):
# password_generator.py
"""A simple password generator that creates random passwords based on user-defined criteria, rates their strength, and copies them to the clipboard."""
import threading
import secrets
import string
import pyperclip

LINE = "=" * 64

def print_banner() -> None:
    print("\n" + LINE)
    print("   🔐  Secure Password Generator")
    print(LINE + "\n")
    return LINE

# Prompting user for password criteria
def user_choice_parameters():
    length = int(input(" Enter desired password length (minimum 8):\n Length: "))
    use_uppercase = input(" Include uppercase letters? (y/n): ").lower() == 'y'
    use_numbers = input(" Include numbers? (y/n): ").lower() == 'y'
    use_special_chars = input(" Include special characters? (y/n): ").lower() == 'y'
    return length, use_uppercase, use_numbers, use_special_chars

# Generate password based on user criteria
def generate_password (length=12, use_uppercase=True, use_numbers=True, use_special_chars=True):    
    if length < 8:
        raise ValueError("Passwords should never be less than 8 characters long.")
    pool = string.ascii_lowercase
    char_types = []
    if use_uppercase:
        pool += string.ascii_uppercase
        char_types.append(string.ascii_uppercase)
    if use_numbers:
        pool += string.digits
        char_types.append(string.digits)
    if use_special_chars:
        pool += string.punctuation
        char_types.append(string.punctuation)

    # Ensure at least one of each selected type
    password_chars = [secrets.choice(t) for t in char_types]
    # Fill the rest
    password_chars += [secrets.choice(pool) for _ in range(length - len(password_chars))]
    import random
    random.shuffle(password_chars)
    password = ''.join(password_chars)
    return password

# Analyze password strength and score it
def rate_password_strength(password):
    length = len(password)
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in string.punctuation for c in password)

    score = 0
    if length >= 16:
        score += 3
    elif length >= 12:
        score += 2
    elif length >= 8:
        score += 1
    if has_upper:
        score += 2
    if has_lower:
        score += 2
    if has_digit:
        score += 2
    if has_special:
        score += 2

    if score >= 11:
        return "Very Strong"
    elif score >= 10:
        return "Strong"
    elif score >= 7:
        return "Moderate"
    else:
        return "Weak"

# Copy to clipboard functionality
def add_password_to_clipboard(password):
    try:
        pyperclip.copy(password)
        print(" Password has been copied to clipboard.\n" + LINE + "\n")
    except ImportError:
        print(" pyperclip module not found. Install it to enable clipboard functionality.\n")



# Main function to run the password generator
def main():
    print_banner()
    while True:
        length, use_uppercase, use_numbers, use_special_chars = user_choice_parameters()
        password = generate_password(length, use_uppercase, use_numbers, use_special_chars)
        print("\n" + LINE + "\n Your randomly generated password is: " + password)
        strength = rate_password_strength(password)
        print(" Password Strength: " + strength + "\n")
        add_password_to_clipboard(password)
        again = input("Generate another password? (y/n): ").strip().lower()
        if again != 'y':
            print("Goodbye!")
            break

if __name__ == "__main__":
    main()

*/
