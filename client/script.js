document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('shapeForm');
    const resultDiv = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sides = document.getElementById('sides').value;
        const symmetry = document.getElementById('symmetry').value;
        const ratio = document.getElementById('ratio').value;

        const payload = {
            sides: parseInt(sides, 10),
            symmetry_axes: parseInt(symmetry, 10),
            convex_hull_ratio: parseFloat(ratio)
        };

        try {
            const response = await fetch('http://localhost:3000/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            resultDiv.innerHTML = `<h2>Classification: ${data.category}</h2><pre>${JSON.stringify(data, null, 2)}</pre>`;
        } catch (error) {
            resultDiv.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
        }
    });
});