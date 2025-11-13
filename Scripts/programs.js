// Interactive demos for Kod.html consolidated into one file.

const emphasiseDiceLetter = (letter) => `<span class="dice-emphasis">${letter}</span>`;

function getRandomDiceImage() {
	const randomNumber1 = Math.floor(Math.random() * 6) + 1;
	const randomDiceImage = "dice" + randomNumber1 + ".png";
	const img1 = document.querySelector(".imgdice1");
	if (img1) {
		img1.setAttribute("src", "../Styles/images/" + randomDiceImage);
	}

	const randomNumber2 = Math.floor(Math.random() * 6) + 1;
	const randomDiceImage2 = "dice" + randomNumber2 + ".png";
	const img2 = document.querySelector(".imgdice2");
	if (img2) {
		img2.setAttribute("src", "../Styles/images/" + randomDiceImage2);
	}

	const heading = document.querySelector(".h1dice");
	if (!heading) return;

	if (randomNumber1 > randomNumber2) {
		heading.innerHTML = `🎲 ${emphasiseDiceLetter('S')}pelare ${emphasiseDiceLetter('1')}  ${emphasiseDiceLetter('V')}inner!`;
	} else if (randomNumber2 > randomNumber1) {
		heading.innerHTML = `${emphasiseDiceLetter('S')}pelare ${emphasiseDiceLetter('2')}  ${emphasiseDiceLetter('V')}inner! 🎲`;
	} else {
		heading.innerHTML = `🎲${emphasiseDiceLetter('O')}avgjort! 🎲`;
	}
}

document.addEventListener(
	"DOMContentLoaded",
	() => {
		const btn = document.querySelector(".button-dice");
		if (!btn) return;

		// ensure it won't submit a form if placed inside one
		if (btn.tagName.toLowerCase() === "button" && !btn.getAttribute("type")) {
			btn.setAttribute("type", "button");
		}

		btn.addEventListener("click", getRandomDiceImage);
	},
	{ once: true }
);

(function () {
	const ready = (fn) => {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', fn, { once: true });
		} else {
			fn();
		}
	};

	const getSection = (title) => {
		const heading = Array.from(document.querySelectorAll('.Koder h2')).find(
			(node) => node.textContent.trim() === title
		);
		if (!heading) {
			return null;
		}
		return { heading, section: heading.parentElement };
	};

	const applyProgramInput = (...elements) => {
		elements.forEach((element) => {
			if (element) {
				element.classList.add('program-input');
			}
		});
	};

	const applyProgramOutput = (...elements) => {
		elements.forEach((element) => {
			if (element) {
				element.classList.add('program-output');
			}
		});
	};

	ready(() => {
		initTyping();
		initWhosPaying();
		initCharacterCount();
		initDogYears();
		initGuestList();
		initLeapYear();
		initLoveTester();
		initLifeCalculator();
		initFizzBuzz();
		initFibonacci();
		initBottles();
	});

	function initTyping() {
		const message = 'Välkommen att utforska mina interaktiva demos, kodade i JavaScript. Skrolla ner och testa programmen!';
		const heading = Array.from(document.querySelectorAll('h1')).find((node) =>
			node.textContent.includes('JavaScript')
		);
		if (!heading) {
			return;
		}
		let container = document.getElementById('typing');
		if (!container) {
			container = document.createElement('div');
			container.id = 'typing';
			heading.insertAdjacentElement('afterend', container);
		}
		container.classList.add('typing-message');

		let index = 0;
		(function step() {
			container.textContent = message.slice(0, index++);
			if (index <= message.length) {
				window.setTimeout(step, 30);
			}
		})();
	}

	function initWhosPaying() {
		const area = getSection('Vem betalar?');
		if (!area) {
			return;
		}
		const { section } = area;
		if (section.querySelector('#nota')) {
			return;
		}

		const notaContainer = document.createElement('div');
		notaContainer.id = 'nota';
		applyProgramOutput(notaContainer);
		notaContainer.classList.add('program-output--note');

		const form = document.createElement('div');
		form.classList.add('program-form', 'program-form--spaced');

		const input = document.createElement('input');
		input.type = 'text';
		input.id = 'namesInput';
		input.placeholder = 'Ange namn, separera med kommatecken';
		applyProgramInput(input);
		input.classList.add('program-input--grow');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Vem betalar?';
		button.classList.add('cta');

		form.appendChild(input);
		form.appendChild(button);

		section.appendChild(notaContainer);
		section.appendChild(form);

		const whosPaying = (names) => {
			if (!Array.isArray(names)) {
				names = [names];
			}
			if (names.length === 0) {
				return null;
			}
			const randomIndex = Math.floor(Math.random() * names.length);
			return names[randomIndex];
		};

		const parseNames = (raw) => {
			if (!raw) {
				return [];
			}
			return raw
				.split(/[,;\n]+/)
				.map((name) => name.trim())
				.filter(Boolean);
		};

		const showResult = (text) => {
			notaContainer.textContent = text;
		};

		const pickAndShow = () => {
			const names = parseNames(input.value);
			if (names.length === 0) {
				showResult('Skriv in minst ett namn (separera med kommatecken).');
				return;
			}
			const winner = whosPaying(names);
			showResult(`${winner} ska bjuda på lunch idag!`);
		};

		button.addEventListener('click', pickAndShow);
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				pickAndShow();
			}
		});

		input.value = 'Anna, Björn, Cecilia';
	}

	function initCharacterCount() {
		const area = getSection('Antal tecken skrivna');
		if (!area) {
			return;
		}
		const { section } = area;
		if (section.querySelector('[data-program="char-count"]')) {
			return;
		}

		const MAX = 140;
		const container = document.createElement('div');
		container.dataset.program = 'char-count';
		container.classList.add('program-section');

		const label = document.createElement('label');
		label.htmlFor = 'weatherInput';
		label.textContent = 'Skriv din text (max 140 tecken):';
		label.classList.add('program-label');

		const textarea = document.createElement('textarea');
		textarea.id = 'weatherInput';
		textarea.rows = 4;
		textarea.maxLength = MAX;
		textarea.placeholder = 'Skriv här...';
		applyProgramInput(textarea);
		textarea.classList.add('program-textarea');

		const controls = document.createElement('div');
		controls.classList.add('program-controls', 'program-controls--spaced');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Visa förhandsgranskning';
		button.classList.add('cta');

		const counter = document.createElement('div');
		counter.classList.add('program-counter');
		counter.textContent = `0 / ${MAX}`;

		controls.appendChild(button);
		controls.appendChild(counter);

		const previewLabel = document.createElement('div');
		previewLabel.textContent = 'Förhandsgranskning:';
		previewLabel.classList.add('program-subheading');

		const preview = document.createElement('pre');
		applyProgramOutput(preview);
		preview.classList.add('program-preview');

		container.appendChild(label);
		container.appendChild(textarea);
		container.appendChild(controls);
		container.appendChild(previewLabel);
		container.appendChild(preview);
		section.appendChild(container);

		const updateCounter = () => {
			const length = textarea.value.length;
			counter.textContent = `${length} / ${MAX} (${MAX - length} kvar)`;
		};

		const updatePreview = () => {
			const text = textarea.value.slice(0, MAX);
			const chars = text.length;
			preview.textContent = `${text}\n\nDu har skrivit ${chars} tecken och har ${MAX - chars} tecken kvar tills max antal av ${MAX}.`;
		};

		textarea.addEventListener('input', updateCounter);
		button.addEventListener('click', updatePreview);
		updateCounter();
	}

	function initDogYears() {
		const area = getSection('Hundår');
		if (!area) {
			return;
		}
		const { section } = area;
		if (section.querySelector('[data-program="dog-years"]')) {
			return;
		}

		const container = document.createElement('div');
		container.dataset.program = 'dog-years';
		container.classList.add('program-section');

		const label = document.createElement('label');
		label.textContent = 'Ange din hunds ålder (år):';
		label.classList.add('program-label');

		const controls = document.createElement('div');
		controls.classList.add('program-controls');

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '0';
		input.step = '0.1';
		input.placeholder = 'e.g. 3.5';
		applyProgramInput(input);
		input.classList.add('program-input--short');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Räkna ut';
		button.classList.add('cta');

		const result = document.createElement('div');
		applyProgramOutput(result);
		result.classList.add('program-result');

		controls.appendChild(input);
		controls.appendChild(button);
		container.appendChild(label);
		container.appendChild(controls);
		container.appendChild(result);
		section.appendChild(container);

		const calcHumanYears = (dogAgeRaw) => {
			const age = Number(dogAgeRaw);
			if (!Number.isFinite(age)) {
				result.textContent = 'Var god ange ett giltigt nummer.';
				return;
			}
			if (age < 0) {
				result.textContent = 'Åldern kan inte vara negativ.';
				return;
			}
			const human = Math.round((age - 2) * 4 + 21);
			result.textContent = `Din ${age} år gamla hund är ${human} år gammal i hundår.`;
		};

		button.addEventListener('click', () => calcHumanYears(input.value));
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				calcHumanYears(input.value);
			}
		});
	}

	function initGuestList() {
		const area = getSection('Gästlista');
		if (!area) {
			return;
		}
		const { section } = area;
		if (section.querySelector('[data-program="guest-list"]')) {
			return;
		}

		const guestList = ['Maja', 'Anton', 'Josefin', 'Janne', 'Barbro', 'Lilly', 'Lava', 'Marie', 'Mats', 'Signe', 'Alvin'];

		const container = document.createElement('div');
		container.dataset.program = 'guest-list';
		container.classList.add('program-section');

		const form = document.createElement('div');
		form.classList.add('program-form');

		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = 'Skriv ditt namn här';
		applyProgramInput(input);
		input.classList.add('program-input--grow');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Kolla gästlista';
		button.classList.add('cta');

		form.appendChild(input);
		form.appendChild(button);

		const result = document.createElement('div');
		applyProgramOutput(result);
		result.classList.add('program-result');

		container.appendChild(form);
		container.appendChild(result);
		section.appendChild(container);

		const checkName = () => {
			const name = input.value.trim();
			if (!name) {
				result.textContent = 'Skriv in ett namn.';
				return;
			}
			const match = guestList.find((guest) => guest.toLowerCase() === name.toLowerCase());
			if (match) {
				result.textContent = `Välkommen till festen, ${match}!`;
			} else {
				result.textContent = `${name} är inte på gästlistan.`;
			}
		};

		button.addEventListener('click', checkName);
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				checkName();
			}
		});
	}

	function initLeapYear() {
		const area = getSection('Skottår');
		if (!area) {
			return;
		}
		const { section } = area;
		if (section.querySelector('[data-program="leap-year"]')) {
			return;
		}

		const container = document.createElement('div');
		container.dataset.program = 'leap-year';
		container.classList.add('program-section');

		const label = document.createElement('label');
		label.textContent = 'Ange ett år för att se om det är ett skottår:';
		label.classList.add('program-label');

		const controls = document.createElement('div');
		controls.classList.add('program-controls');

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '0';
		input.step = '1';
		input.placeholder = 't.ex. 2024';
		applyProgramInput(input);
		input.classList.add('program-input--short');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Kontrollera';
		button.classList.add('cta');

		const result = document.createElement('div');
		applyProgramOutput(result);
		result.classList.add('program-result');

		controls.appendChild(input);
		controls.appendChild(button);
		container.appendChild(label);
		container.appendChild(controls);
		container.appendChild(result);
		section.appendChild(container);

		const isLeap = (year) => {
			const value = Number(year);
			if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
				return null;
			}
			if (value % 4 !== 0) {
				return false;
			}
			if (value % 100 !== 0) {
				return true;
			}
			if (value % 400 !== 0) {
				return false;
			}
			return true;
		};

		const showResultForYear = (value) => {
			const year = Number(value);
			if (!Number.isFinite(year) || !Number.isInteger(year)) {
				result.textContent = 'Var god ange ett giltigt heltal för året.';
				return;
			}
			const leap = isLeap(year);
			if (leap === null) {
				result.textContent = 'Ogiltigt år.';
			} else if (leap) {
				result.textContent = `År ${year} är ett skottår.`;
			} else {
				result.textContent = `År ${year} är inte ett skottår.`;
			}
		};

		button.addEventListener('click', () => showResultForYear(input.value));
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				showResultForYear(input.value);
			}
		});

		input.value = new Date().getFullYear();
	}

	function initLoveTester() {
		const area = getSection('Love-tester');
		if (!area) {
			return;
		}
		const { section } = area;
		if (section.querySelector('[data-program="love-tester"]')) {
			return;
		}

		const container = document.createElement('div');
		container.dataset.program = 'love-tester';
		container.classList.add('program-section');

		const form = document.createElement('div');
		form.classList.add('program-form', 'program-form--wrap');

		const input1 = document.createElement('input');
		input1.type = 'text';
		input1.placeholder = 'Namn på person 1';
		applyProgramInput(input1);
		input1.classList.add('program-input--grow', 'program-input--wide');

		const input2 = document.createElement('input');
		input2.type = 'text';
		input2.placeholder = 'Namn på person 2';
		applyProgramInput(input2);
		input2.classList.add('program-input--grow', 'program-input--wide');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Kontrollera kärlekskompabilitet';
		button.classList.add('cta');

		form.appendChild(input1);
		form.appendChild(input2);
		form.appendChild(button);

		const result = document.createElement('pre');
		applyProgramOutput(result);
		result.classList.add('program-output--block');

		container.appendChild(form);
		container.appendChild(result);
		section.appendChild(container);

		const compute = () => {
			const name1 = input1.value.trim() || 'Person A';
			const name2 = input2.value.trim() || 'Person B';
			const loveChance = Math.floor(Math.random() * 100) + 1;
			let message;
			if (loveChance === 100) {
				message = `${name1} + ${name2} = en perfekt match på 100%!`;
			} else if (loveChance > 70) {
				message = `${name1} + ${name2} = en fantastisk match på ${loveChance}%.`;
			} else if (loveChance > 30) {
				message = `${name1} + ${name2} = en dålig match på bara ${loveChance}%...`;
			} else {
				message = `${name1} + ${name2} = en usel match på bara ${loveChance}%...`;
			}
			const fightChance = Math.floor(Math.random() * 100) + 1;
			message += `\n...och det är ${fightChance}% chans att ${name2} vinner i ett slagsmål.`;
			result.textContent = message;
		};

		button.addEventListener('click', compute);
		[input1, input2].forEach((input) => {
			input.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') {
					event.preventDefault();
					compute();
				}
			});
		});

		input1.value = 'Anton';
		input2.value = 'Antons fru';
	}

	function initLifeCalculator() {
		const area = getSection('Hur länge har du kvar att leva?');
		if (!area) {
			return;
		}
		const { section } = area;
		if (section.querySelector('[data-program="life-calculator"]')) {
			return;
		}

		const container = document.createElement('div');
		container.dataset.program = 'life-calculator';
		container.classList.add('program-section');

		const label = document.createElement('label');
		label.textContent = 'Ange din ålder i år:';
		label.classList.add('program-label');

		const controls = document.createElement('div');
		controls.classList.add('program-controls');

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '0';
		input.step = '0.1';
		input.placeholder = 't.ex. 29.5';
		applyProgramInput(input);
		input.classList.add('program-input--short');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Beräkna';
		button.classList.add('cta');

		const result = document.createElement('div');
		applyProgramOutput(result);
		result.classList.add('program-result');

		controls.appendChild(input);
		controls.appendChild(button);
		container.appendChild(label);
		container.appendChild(controls);
		container.appendChild(result);
		section.appendChild(container);

		const lifeInWeeks = (age, deathYear = 90) => {
			const value = Number(age);
			if (!Number.isFinite(value) || value < 0) {
				result.textContent = 'Var god ange en giltig ålder (nummer >= 0).';
				return;
			}
			if (value >= deathYear) {
				result.textContent = `Du är redan ${value} år eller äldre — målet (${deathYear} år) är uppnått.`;
				return;
			}
			const days = Math.round((deathYear - value) * 365);
			const weeks = Math.round((deathYear - value) * 52);
			const months = Math.round((deathYear - value) * 12);
			result.textContent = `Du har ungefär ${days} dagar, ${weeks} veckor och ${months} månader kvar tills du blir ${deathYear} år.`;
		};

		button.addEventListener('click', () => lifeInWeeks(input.value));
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				lifeInWeeks(input.value);
			}
		});

		input.value = '29';
	}

	function initFizzBuzz() {
		const area = getSection('FizzBuzz');
		if (!area) {
			return;
		}
		const { section } = area;
		if (section.querySelector('[data-program="fizzbuzz"]')) {
			return;
		}

		const container = document.createElement('div');
		container.dataset.program = 'fizzbuzz';
		container.classList.add('program-section');

		const label = document.createElement('label');
		label.textContent = 'FizzBuzz (kontrollera delbarhet med 2, 3 och 5). Ange högsta tal:';
		label.classList.add('program-label');

		const controls = document.createElement('div');
		controls.classList.add('program-controls', 'program-controls--spaced');

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '1';
		input.max = '10000';
		input.value = '10';
		applyProgramInput(input);
		input.classList.add('program-input--short');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Kör FizzBuzz';
		button.classList.add('cta');

		controls.appendChild(input);
		controls.appendChild(button);

		const outputInfo = document.createElement('div');
		outputInfo.classList.add('program-info');

		const result = document.createElement('div');
		applyProgramOutput(result);
		result.classList.add('program-output--scroll');

		container.appendChild(label);
		container.appendChild(controls);
		container.appendChild(outputInfo);
		container.appendChild(result);
		section.appendChild(container);

		const joinWithOch = (arr) => {
			if (arr.length === 0) {
				return '';
			}
			if (arr.length === 1) {
				return String(arr[0]);
			}
			if (arr.length === 2) {
				return `${arr[0]} och ${arr[1]}`;
			}
			return `${arr.slice(0, -1).join(', ')} och ${arr[arr.length - 1]}`;
		};

		const runFizzBuzz = () => {
			result.innerHTML = '';
			outputInfo.textContent = '';
			const n = Number(input.value);
			if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
				outputInfo.textContent = 'Ange ett giltigt heltal >= 1.';
				return;
			}
			if (n > 5000) {
				outputInfo.textContent = 'Varning: stort värde kan göra sidan långsam. Begränsa under 5000.';
			}

			const list = document.createElement('ul');
			list.classList.add('program-list');

			for (let i = 1; i <= n; i++) {
				const divisors = [];
				if (i % 2 === 0) {
					divisors.push(2);
				}
				if (i % 3 === 0) {
					divisors.push(3);
				}
				if (i % 5 === 0) {
					divisors.push(5);
				}

				const item = document.createElement('li');
				item.classList.add('program-list-item');
				if (divisors.length === 3) {
					item.classList.add('program-list-item--three');
				} else if (divisors.length === 2) {
					item.classList.add('program-list-item--two');
				} else if (divisors.length === 1) {
					item.classList.add('program-list-item--one');
				} else {
					item.classList.add('program-list-item--zero');
				}

				if (divisors.length === 0) {
					item.textContent = String(i);
				} else {
					item.textContent = `${i} är delbart med ${joinWithOch(divisors)}.`;
				}
				list.appendChild(item);
			}

			result.appendChild(list);
			outputInfo.textContent = `Visar resultat för 1 → ${n}.`;
			result.scrollTop = 0;
		};

		button.addEventListener('click', runFizzBuzz);
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				runFizzBuzz();
			}
		});

		runFizzBuzz();
	}

	function initFibonacci() {
		const area = getSection('Fibonacci-sekvenser');
		if (!area) {
			return;
		}
		const { section } = area;
		if (section.querySelector('[data-program="fibonacci"]')) {
			return;
		}

		const container = document.createElement('div');
		container.dataset.program = 'fibonacci';
		container.classList.add('program-section');

		const label = document.createElement('label');
		label.textContent = 'Generera Fibonacci-sekvens (antal tal):';
		label.classList.add('program-label');

		const controls = document.createElement('div');
		controls.classList.add('program-controls');

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '0';
		input.max = '500';
		input.value = '10';
		applyProgramInput(input);
		input.classList.add('program-input--narrow');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Generera';
		button.classList.add('cta');

		const info = document.createElement('div');
		info.classList.add('program-info');

		const output = document.createElement('pre');
		applyProgramOutput(output);
		output.classList.add('program-output--block');

		container.appendChild(label);
		container.appendChild(controls);
		container.appendChild(info);
		container.appendChild(output);
		controls.appendChild(input);
		controls.appendChild(button);
		section.appendChild(container);

		const fibonacciGenerator = (n) => {
			const count = Number(n);
			if (!Number.isFinite(count) || !Number.isInteger(count) || count < 0) {
				return null;
			}
			const fib = [];
			for (let i = 0; i < count; i++) {
				if (i === 0) {
					fib.push(0);
				} else if (i === 1) {
					fib.push(1);
				} else {
					fib.push(fib[i - 1] + fib[i - 2]);
				}
			}
			return fib;
		};

		const render = (n) => {
			output.textContent = '';
			info.textContent = '';
			const num = Number(n);
			if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0) {
				info.textContent = 'Ange ett giltigt heltal >= 0.';
				return;
			}
			if (num > 200) {
				info.textContent = 'Stort antal; visning kan bli långsam.';
			}
			const sequence = fibonacciGenerator(num) || [];
			output.textContent = sequence.length === 0 ? '(Inga tal)' : sequence.join(', ');
			if (sequence.length > 0) {
				const lines = sequence
					.map((value, index) => `${index + 1}: ${value}`)
					.join('\n');
				output.textContent = `${output.textContent}\n\nIndex:värde\n${lines}`;
			}
		};

		button.addEventListener('click', () => render(input.value));
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				render(input.value);
			}
		});

		render(input.value);
	}

	function initBottles() {
		const area = getSection('X bottles of beers on the wall..');
		if (!area) {
			return;
		}
		const { section } = area;
		if (section.querySelector('[data-program="bottles"]')) {
			return;
		}

		const container = document.createElement('div');
		container.dataset.program = 'bottles';
		container.classList.add('program-section');

		const label = document.createElement('label');
		label.textContent = 'Ange antal flaskor öl som heltal (rekommenderar max 10):';
		label.classList.add('program-label');

		const controls = document.createElement('div');
		controls.classList.add('program-controls');

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '0';
		input.max = '100';
		input.value = '3';
		applyProgramInput(input);
		input.classList.add('program-input--short');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Visa sången';
		button.classList.add('cta');

		const info = document.createElement('div');
		info.classList.add('program-info');

		const output = document.createElement('pre');
		applyProgramOutput(output);
		output.classList.add('program-output--scroll');

		controls.appendChild(input);
		controls.appendChild(button);
		container.appendChild(label);
		container.appendChild(controls);
		container.appendChild(info);
		container.appendChild(output);
		section.appendChild(container);

		const stanzaLines = (n) => {
			if (n > 2) {
				return [
					`${n} bottles of beer on the wall, ${n} bottles of beer.`,
					`Take one down and pass it around, ${n - 1} ${n - 1 === 1 ? 'bottle' : 'bottles'} of beer on the wall.`,
				];
			}
			if (n === 2) {
				return [
					'2 bottles of beer on the wall, 2 bottles of beer.',
					'Take one down and pass it around, 1 bottle of beer on the wall.',
				];
			}
			if (n === 1) {
				return [
					'1 bottle of beer on the wall, 1 bottle of beer.',
					'Take one down and pass it around, no more bottles of beer on the wall.',
				];
			}
			return [
				'No more bottles of beer on the wall, no more bottles of beer.',
				'Go to the store and buy some more, 99 bottles of beer on the wall.',
			];
		};

		const generateSong = (raw) => {
			const value = Number(raw);
			if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
				info.textContent = 'Ange ett giltigt heltal >= 0.';
				return '';
			}
			if (value > 300) {
				info.textContent = 'Stort antal — visar upp till 300 för prestanda.';
			} else {
				info.textContent = '';
			}
			const cap = Math.min(value, 300);
			const parts = [];
			for (let i = cap; i >= 0; i--) {
				parts.push(...stanzaLines(i));
				if (i !== 0) {
					parts.push('');
				}
			}
			if (value > cap) {
				parts.push('', `...truncated (${value - cap} stanzas borttagnade för prestanda).`);
			}
			return parts.join('\n');
		};

		const showSong = () => {
			output.textContent = generateSong(input.value);
			output.scrollTop = 0;
		};

		button.addEventListener('click', showSong);
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				showSong();
			}
		});

		showSong();
	}
})();
