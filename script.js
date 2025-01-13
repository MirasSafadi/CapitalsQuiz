document.addEventListener('DOMContentLoaded', async () => {
    const formContainer = document.getElementById('form-container');

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
            title.textContent = `What is the capital of ${country.name}?`;
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
            funFact.textContent = `Fun Fact: ${country.fun_fact}`;
            funFact.style.display = 'none';
            funFact.id = 'fun-fact';
            form.appendChild(funFact);
			
            const submitButton = document.createElement('button');
            submitButton.type = 'submit';
            submitButton.textContent = 'Submit';
            submitButton.classList.add('btn', 'btn-primary', 'mt-3');
            form.appendChild(submitButton);
			
			
            const nextButton = document.createElement('button');
			nextButton.id='nxtBtn';
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
                    resultLabel.textContent = isCorrect ? 'Correct answer!' : `Wrong answer.`;
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
});
