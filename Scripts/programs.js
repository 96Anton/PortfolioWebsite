// Interactive demos for Kod.html consolidated into one file.
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
			container.style.fontFamily = 'monospace';
			container.style.margin = '0.5rem 0 1rem';
			container.style.whiteSpace = 'pre-wrap';
			container.style.fontSize = '1.2em';
			container.style.textAlign = 'center';
			heading.insertAdjacentElement('afterend', container);
		}

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
		notaContainer.style.fontFamily = 'monospace';
		notaContainer.style.margin = '0.5rem 0 1rem';
		notaContainer.style.whiteSpace = 'pre-wrap';
		notaContainer.style.fontSize = '1.2em';

		const form = document.createElement('div');
		form.style.display = 'flex';
		form.style.gap = '0.5rem';
		form.style.alignItems = 'center';
		form.style.margin = '0.5rem 0';

		const input = document.createElement('input');
		input.type = 'text';
		input.id = 'namesInput';
		input.placeholder = 'Ange namn, separera med kommatecken';
		input.style.flex = '1';
		input.style.padding = '0.4rem';
		input.style.fontSize = '1rem';

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Vem betalar?';
		button.style.padding = '0.4rem 0.6rem';
		button.style.fontSize = '1rem';
		button.style.cursor = 'pointer';

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
		container.style.margin = '0.5rem 0 1rem';
		container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';

		const label = document.createElement('label');
		label.htmlFor = 'weatherInput';
		label.textContent = 'Skriv din text (max 140 tecken):';
		label.style.display = 'block';
		label.style.marginBottom = '0.3rem';

		const textarea = document.createElement('textarea');
		textarea.id = 'weatherInput';
		textarea.rows = 4;
		textarea.maxLength = MAX;
		textarea.placeholder = 'Skriv här...';
		textarea.style.width = '100%';
		textarea.style.padding = '0.4rem';
		textarea.style.boxSizing = 'border-box';
		textarea.style.fontSize = '1rem';
		textarea.style.fontFamily = 'monospace';
		textarea.style.marginBottom = '0.4rem';

		const controls = document.createElement('div');
		controls.style.display = 'flex';
		controls.style.alignItems = 'center';
		controls.style.gap = '0.5rem';
		controls.style.marginBottom = '0.5rem';
		controls.style.color = '#fff';

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Visa förhandsgranskning';
		button.style.padding = '0.4rem 0.6rem';
		button.style.cursor = 'pointer';

		const counter = document.createElement('div');
		counter.style.fontSize = '0.95rem';
		counter.style.color = '#fff';
		counter.style.whiteSpace = 'nowrap';
		counter.textContent = `0 / ${MAX}`;

		controls.appendChild(button);
		controls.appendChild(counter);

		const previewLabel = document.createElement('div');
		previewLabel.textContent = 'Förhandsgranskning:';
		previewLabel.style.margin = '0.4rem 0 0.2rem';
		previewLabel.style.fontWeight = '600';

		const preview = document.createElement('pre');
		preview.style.background = '#f7f7f7';
		preview.style.padding = '0.6rem';
		preview.style.whiteSpace = 'pre-wrap';
		preview.style.borderRadius = '4px';
		preview.style.minHeight = '3rem';
		preview.style.margin = '0';
		preview.style.color = '#000';

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
		container.style.margin = '0.5rem 0 1rem';
		container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial';

		const label = document.createElement('label');
		label.textContent = 'Ange din hunds ålder (år):';
		label.style.display = 'block';
		label.style.marginBottom = '0.3rem';
		label.style.color = '#fff';

		const controls = document.createElement('div');
		controls.style.display = 'flex';
		controls.style.alignItems = 'center';
		controls.style.gap = '0.5rem';

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '0';
		input.step = '0.1';
		input.placeholder = 'e.g. 3.5';
		input.style.padding = '0.4rem';
		input.style.fontSize = '1rem';
		input.style.width = '8rem';

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Räkna ut';
		button.style.padding = '0.4rem 0.6rem';
		button.style.cursor = 'pointer';

		const result = document.createElement('div');
		result.style.marginTop = '0.5rem';
		result.style.fontWeight = '600';

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
		container.style.margin = '0.5rem 0 1rem';
		container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial';

		const form = document.createElement('div');
		form.style.display = 'flex';
		form.style.gap = '0.5rem';
		form.style.alignItems = 'center';

		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = 'Skriv ditt namn här';
		input.style.flex = '1';
		input.style.padding = '0.4rem';
		input.style.fontSize = '1rem';

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Kolla gästlista';
		button.style.padding = '0.4rem 0.6rem';
		button.style.cursor = 'pointer';

		form.appendChild(input);
		form.appendChild(button);

		const result = document.createElement('div');
		result.style.marginTop = '0.4rem';
		result.style.fontWeight = '600';

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
		container.style.margin = '0.5rem 0 1rem';
		container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial';

		const label = document.createElement('label');
		label.textContent = 'Ange ett år för att se om det är ett skottår:';
		label.style.display = 'block';
		label.style.marginBottom = '0.3rem';

		const controls = document.createElement('div');
		controls.style.display = 'flex';
		controls.style.gap = '0.5rem';
		controls.style.alignItems = 'center';

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '0';
		input.step = '1';
		input.placeholder = 't.ex. 2024';
		input.style.padding = '0.4rem';
		input.style.fontSize = '1rem';
		input.style.width = '8rem';

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Kontrollera';
		button.style.padding = '0.4rem 0.6rem';
		button.style.cursor = 'pointer';

		const result = document.createElement('div');
		result.style.marginTop = '0.5rem';
		result.style.fontWeight = '600';

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
		container.style.margin = '0.5rem 0 1rem';
		container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial';

		const form = document.createElement('div');
		form.style.display = 'flex';
		form.style.flexWrap = 'wrap';
		form.style.gap = '0.5rem';
		form.style.alignItems = 'center';

		const input1 = document.createElement('input');
		input1.type = 'text';
		input1.placeholder = 'Namn på person 1';
		input1.style.flex = '1';
		input1.style.minWidth = '10rem';
		input1.style.padding = '0.4rem';
		input1.style.fontSize = '1rem';

		const input2 = document.createElement('input');
		input2.type = 'text';
		input2.placeholder = 'Namn på person 2';
		input2.style.flex = '1';
		input2.style.minWidth = '10rem';
		input2.style.padding = '0.4rem';
		input2.style.fontSize = '1rem';

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Kontrollera kärlekskompabilitet';
		button.style.padding = '0.4rem 0.6rem';
		button.style.cursor = 'pointer';

		form.appendChild(input1);
		form.appendChild(input2);
		form.appendChild(button);

		const result = document.createElement('pre');
		result.style.marginTop = '0.5rem';
		result.style.fontWeight = '600';
		result.style.whiteSpace = 'pre-wrap';
		result.style.background = '#000';
		result.style.padding = '0.6rem';
		result.style.borderRadius = '4px';
		result.style.minHeight = '2.2rem';
		result.style.margin = '0.5rem 0 0';

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
		container.style.margin = '0.5rem 0 1rem';
		container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial';

		const label = document.createElement('label');
		label.textContent = 'Ange din ålder i år:';
		label.style.display = 'block';
		label.style.marginBottom = '0.3rem';

		const controls = document.createElement('div');
		controls.style.display = 'flex';
		controls.style.gap = '0.5rem';
		controls.style.alignItems = 'center';

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '0';
		input.step = '0.1';
		input.placeholder = 't.ex. 29.5';
		input.style.padding = '0.4rem';
		input.style.fontSize = '1rem';
		input.style.width = '8rem';

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Beräkna';
		button.style.padding = '0.4rem 0.6rem';
		button.style.cursor = 'pointer';

		const result = document.createElement('div');
		result.style.marginTop = '0.5rem';
		result.style.fontWeight = '600';

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
		container.style.margin = '0.5rem 0 1rem';
		container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial';

		const label = document.createElement('label');
		label.textContent = 'FizzBuzz (kontrollera delbarhet med 2, 3 och 5). Ange högsta tal:';
		label.style.display = 'block';
		label.style.marginBottom = '0.3rem';

		const controls = document.createElement('div');
		controls.style.display = 'flex';
		controls.style.gap = '0.5rem';
		controls.style.alignItems = 'center';
		controls.style.marginBottom = '0.5rem';

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '1';
		input.max = '10000';
		input.value = '10';
		input.style.padding = '0.4rem';
		input.style.fontSize = '1rem';
		input.style.width = '8rem';

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Kör FizzBuzz';
		button.style.padding = '0.4rem 0.6rem';
		button.style.cursor = 'pointer';

		controls.appendChild(input);
		controls.appendChild(button);

		const outputInfo = document.createElement('div');
		outputInfo.style.margin = '0.25rem 0';
		outputInfo.style.fontSize = '0.95rem';
		outputInfo.style.color = '#fff';

		const result = document.createElement('div');
		result.style.marginTop = '0.5rem';
		result.style.padding = '0.5rem';
		result.style.background = '#fff';
		result.style.borderRadius = '6px';
		result.style.maxHeight = '320px';
		result.style.overflow = 'auto';
		result.style.fontFamily = 'monospace';
		result.style.whiteSpace = 'pre-wrap';

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
			list.style.listStyle = 'none';
			list.style.padding = '0';
			list.style.margin = '0';

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
				item.style.padding = '0.15rem 0';
				if (divisors.length === 3) {
					item.style.color = '#6a0dad';
				} else if (divisors.length === 2) {
					item.style.color = '#d2691e';
				} else if (divisors.length === 1) {
					item.style.color = '#007700';
				} else {
					item.style.color = '#000';
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
		container.style.margin = '0.5rem 0 1rem';
		container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial';

		const label = document.createElement('label');
		label.textContent = 'Generera Fibonacci-sekvens (antal tal):';
		label.style.display = 'block';
		label.style.marginBottom = '0.3rem';

		const controls = document.createElement('div');
		controls.style.display = 'flex';
		controls.style.gap = '0.5rem';
		controls.style.alignItems = 'center';

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '0';
		input.max = '500';
		input.value = '10';
		input.style.width = '6rem';
		input.style.padding = '0.4rem';
		input.style.fontSize = '1rem';

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Generera';
		button.style.padding = '0.4rem 0.6rem';
		button.style.cursor = 'pointer';

		const info = document.createElement('div');
		info.style.marginTop = '0.4rem';
		info.style.fontSize = '0.95rem';
		info.style.color = '#333';

		const output = document.createElement('pre');
		output.style.marginTop = '0.5rem';
		output.style.whiteSpace = 'pre-wrap';
		output.style.background = '#000';
		output.style.padding = '0.6rem';
		output.style.borderRadius = '4px';
		output.style.fontFamily = 'monospace';

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
		container.style.margin = '0.5rem 0 1rem';
		container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial';

		const label = document.createElement('label');
		label.textContent = 'Ange antal flaskor öl som heltal (rekommenderar max 10):';
		label.style.display = 'block';
		label.style.marginBottom = '0.3rem';

		const controls = document.createElement('div');
		controls.style.display = 'flex';
		controls.style.gap = '0.5rem';
		controls.style.alignItems = 'center';

		const input = document.createElement('input');
		input.type = 'number';
		input.min = '0';
		input.max = '100';
		input.value = '3';
		input.style.width = '8rem';
		input.style.padding = '0.4rem';
		input.style.fontSize = '1rem';

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = 'Visa sången';
		button.style.padding = '0.4rem 0.6rem';
		button.style.cursor = 'pointer';

		const info = document.createElement('div');
		info.style.marginTop = '0.4rem';
		info.style.fontSize = '0.95rem';
		info.style.color = '#333';

		const output = document.createElement('pre');
		output.style.marginTop = '0.5rem';
		output.style.whiteSpace = 'pre-wrap';
		output.style.background = '#000';
		output.style.padding = '0.6rem';
		output.style.borderRadius = '4px';
		output.style.fontFamily = 'monospace';
		output.style.maxHeight = '320px';
		output.style.overflow = 'auto';
		output.style.color = '#fff';

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
