if (document.getElementById('signUpForm')) {
    document.getElementById('signUpForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        // Send a POST request to the backend
        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            window.location.href = './signin.html'; // Redirect to the sign-in page
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
}

if (document.getElementById('signInForm')) {
    document.getElementById('signInForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Collect form data
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        // Send a POST request to the backend
        fetch('/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => {
            if (response.ok) {
              return response.json(); // Parse JSON response
            } else {
              throw new Error('Authentication failed');
            }
        })
        .then(data => {
            window.location.href = data.redirectURL; // Redirect the user
        })
        .catch((error) => {
            console.error('Error:', error);
            alert(error.message);
        });
    });
}
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', function(event) {
        // Clear any stored data (e.g., localStorage/sessionStorage)
        localStorage.removeItem('user');
        // Redirect to sign-in page
        window.location.href = './signin.html';
    });
}

if (document.getElementById('createFormBtn')) {
    document.getElementById('createFormBtn').addEventListener('click', function(event) {
        // Redirect to CarsForm.html
        window.location.href = './CarsForm.html';
    });
}

if (document.getElementById('carsForm')) {
    document.getElementById('carsForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Collect form data
        const carData = {
            name: document.getElementById('name').value,
            lastName: document.getElementById('lastName').value,
            lotNumber: document.getElementById('lotNumber').value,
            carBrand: document.getElementById('carBrand').value
        };

        // Send a POST request to the backend
        fetch('/cars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(carData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Car saved:', data);
            window.location.href = './welcome.html'; // Redirect back to welcome page
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('carsTable')) {
        // Fetch the car data from the server
        fetch('/cars-data')
            .then(response => response.json())
            .then(cars => {
                // Get the table body element
                const tableBody = document.getElementById('carsTable').querySelector('tbody');
                // Clear existing table data
                tableBody.innerHTML = '';
                // Populate the table with car data
                cars.forEach(car => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${car.name}</td>
                        <td>${car.lastName}</td>
                        <td>${car.lotNumber}</td>
                        <td>${car.carBrand}</td>
                        <td>
                        <button onclick="editCar('${car._id}')">Edit</button>
                        <button onclick="deleteCar('${car._id}', this)">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching cars:', error);
            });
    }
});

function editCar(id) {
    // Redirect to CarsForm.html with the car ID as a query parameter
    window.location.href = `./editCarsForm.html?id=${id}`;
}


function deleteCar(id, element) {
    fetch(`/cars/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            element.parentElement.parentElement.remove();
        } else {
            alert('Error deleting car');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id'); // Extract car ID from URL

    // Prefill the form if a carId is present, indicating we're editing an existing car.
    if (carId) {
        fetch(`/cars/${carId}`)
            .then(response => response.json())
            .then(car => {
                document.getElementById('name').value = car.name;
                document.getElementById('lastName').value = car.lastName;
                document.getElementById('lotNumber').value = car.lotNumber;
                document.getElementById('carBrand').value = car.carBrand;
            })
            .catch(error => console.error('Error:', error));
    }

    const carsForm = document.getElementById('editCarsForm');
    carsForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior.

        const carData = {
            name: document.getElementById('name').value,
            lastName: document.getElementById('lastName').value,
            lotNumber: document.getElementById('lotNumber').value,
            carBrand: document.getElementById('carBrand').value,
        };

        // Determine the appropriate method and endpoint based on the presence of carId.
        const method = carId ? 'PUT' : 'POST';
        const endpoint = carId ? `/cars/${carId}` : '/cars';

        fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData),
        })
        .then(response => response.json())
        .then(() => window.location.href = './welcome.html') // Redirect after successful operation
        .catch(error => console.error('Error:', error));
    });
});