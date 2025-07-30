document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const diseaseGrid = document.getElementById('diseaseGrid');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalCause = document.getElementById('modalCause');
    const modalPrevention = document.getElementById('modalPrevention');
    const modalTreatment = document.getElementById('modalTreatment');
    const closeButton = document.querySelector('.close-button');
    const loader = document.getElementById('loader');
    const shareButton = document.getElementById('shareButton');

    let diseases = [];
    let fuse;

    async function fetchDiseases() {
        loader.style.display = 'block';
        diseaseGrid.style.display = 'none';
        try {
            const completion = await websim.chat.completions.create({
                messages: [{
                    role: "system",
                    content: `Generate a JSON array of 101 common and diverse diseases. Each object in the array should have the following properties: "name" (string), "cause" (string, a concise explanation), "prevention" (string, concise preventative measures), and "treatment" (string, common treatments). Ensure the JSON is well-formed. Respond with only the JSON array.`,
                }, {
                    role: "user",
                    content: "Please generate the list of diseases."
                }, ],
                json: true,
            });
            diseases = JSON.parse(completion.content);

            const options = {
                keys: ['name'],
                includeScore: true,
                threshold: 0.4
            };
            fuse = new Fuse(diseases, options);

            displayDiseases(diseases);
        } catch (error) {
            console.error('Error fetching disease data:', error);
            diseaseGrid.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Failed to load disease data. Please try again later.</p>';
        } finally {
            loader.style.display = 'none';
            diseaseGrid.style.display = 'grid';
        }
    }

    function displayDiseases(diseaseList) {
        diseaseGrid.innerHTML = '';
        diseaseList.forEach(disease => {
            const card = document.createElement('div');
            card.className = 'disease-card';
            card.dataset.name = disease.name;
            card.innerHTML = `<h3>${disease.name}</h3>`;
            card.addEventListener('click', () => openModal(disease));
            diseaseGrid.appendChild(card);
        });
    }

    function openModal(disease) {
                modalTitle.textContent = disease.name;
        modalCause.textContent = disease.cause;
        modalPrevention.textContent = disease.prevention;
        modalTreatment.textContent = disease.treatment;
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query) {
            const results = fuse.search(query).map(result => result.item);
            displayDiseases(results);
        } else {
            displayDiseases(diseases);
        }
    });

    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    shareButton.addEventListener('click', () => {
        alert("This is an interactive preview of your website.\n\nTo get a shareable URL, you would typically deploy the project to a web hosting service. Once deployed, you could share its public URL with anyone!");
    });

    fetchDiseases();
});