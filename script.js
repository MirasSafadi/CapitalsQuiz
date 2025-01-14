document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const body = document.body;

    // Lock screen with a passcode prompt
    const passcodePrompt = document.createElement('div');
    passcodePrompt.classList.add('d-flex', 'justify-content-center', 'align-items-center', 'vh-100');
    passcodePrompt.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)';
    passcodePrompt.innerHTML = `
        <div class="container text-center bg-white p-4 rounded shadow">
            <h2 class="mb-3">Enter Passcode</h2>
            <form id="passcode-form">
                <input type="password" id="passcode" class="form-control mb-3" placeholder="Passcode" required />
                <button type="submit" class="btn btn-primary">Unlock</button>
            </form>
        </div>
    `;

    body.appendChild(passcodePrompt);

    const correctPasscodeHash = '64a4bed498e4060a5deb747c1936e490ef7d744a4ce94801eaf5d781d0d786e2';

    async function hashPasscode(passcode) {
        const encoder = new TextEncoder();
        const data = encoder.encode(passcode);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    document.getElementById('passcode-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const enteredPasscode = document.getElementById('passcode').value;
        const enteredPasscodeHash = await hashPasscode(enteredPasscode);

        if (enteredPasscodeHash === correctPasscodeHash) {
            passcodePrompt.remove();
            initializeQuiz();
        } else {
            alert('Incorrect passcode. Please try again.');
        }
    });

    const initializeQuiz = async () => {
        try {
            // Fetch the JSON data from a file
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();

            // Validate the structure of jsonData
            if (!jsonData.countries || !Array.isArray(jsonData.countries)) {
                throw new Error('Invalid JSON structure: "countries" must be an array.');
            }

            // Function to generate a form for a random country
            const generateRandomForm = () => {
                // Clear the previous form
                formContainer.innerHTML = '';

                const randomIndex = Math.floor(Math.random() * jsonData.countries.length);
                const country = jsonData.countries[randomIndex];

                const form = document.createElement('form');
                form.classList.add('mb-4');

                const title = document.createElement('h3');
                title.textContent = `Country: ${country.name}`;
                form.appendChild(title);

                country.answers.forEach((answer, index) => {
                    const formGroup = document.createElement('div');
                    formGroup.classList.add('form-check');

                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.name = 'answers';
                    input.id = `answer_${index}`;
                    input.value = answer;
                    input.classList.add('form-check-input');

                    const label = document.createElement('label');
                    label.textContent = answer;
                    label.setAttribute('for', input.id);
                    label.classList.add('form-check-label');

                    formGroup.appendChild(input);
                    formGroup.appendChild(label);
                    form.appendChild(formGroup);
                });

                // Add space between the answers and the submit button
                const spacer = document.createElement('div');
                spacer.style.height = '20px';
                form.appendChild(spacer);

                const resultLabel = document.createElement('p');
                resultLabel.id = 'result-label';
                resultLabel.style.display = 'none';
                resultLabel.classList.add('mt-3');
                form.appendChild(resultLabel);

                const funFact = document.createElement('p');
                funFact.innerHTML = `<strong>Fun Fact:</strong> ${country.fun_fact}`;
                funFact.style.display = 'none';
                funFact.id = 'fun-fact';
                form.appendChild(funFact);

                const submitButton = document.createElement('button');
                submitButton.type = 'submit';
                submitButton.textContent = 'Submit';
                submitButton.classList.add('btn', 'btn-primary', 'mt-3');
                form.appendChild(submitButton);
			

                const nextButton = document.createElement('button');
                nextButton.type = 'button';
                nextButton.textContent = 'Next';
                nextButton.classList.add('btn', 'btn-secondary', 'mt-3');
                nextButton.style.display = 'none';
                form.appendChild(nextButton);

                formContainer.appendChild(form);

                // Add event listener for form submission
                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const selectedAnswer = form.querySelector('input[name="answers"]:checked');
                    const resultLabel = document.getElementById('result-label');
                    const funFact = document.getElementById('fun-fact');
                    if (selectedAnswer) {
                        const isCorrect = selectedAnswer.value === country.correct_answer;
                        resultLabel.textContent = isCorrect ? 'Correct answer!' : `Wrong answer. The correct answer is: ${country.correct_answer}`;
                        resultLabel.style.color = isCorrect ? 'green' : 'red';
                        resultLabel.style.display = 'block';
                        funFact.style.display = isCorrect ? 'block' : 'none';
                        if (isCorrect) {
                            nextButton.style.display = 'inline-block';
                        }
                    } else {
                        resultLabel.textContent = 'Please select an answer.';
                        resultLabel.style.color = 'red';
                        resultLabel.style.display = 'block';
                    }
                });

                // Modify event listener for the next button
                nextButton.addEventListener('click', () => {
                    generateRandomForm();
                });
            };

            // Generate the first form on page load
            generateRandomForm();
        } catch (error) {
            console.error('Error loading JSON data:', error);
            formContainer.textContent = 'Failed to load form data.';
        }
    };
});
