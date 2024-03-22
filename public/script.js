document.addEventListener('DOMContentLoaded', function() {
    // SignUp Form Event Listener
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the form from submitting the traditional way

            // Collect form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
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

    // SignIn Form Event Listener
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the form from submitting the traditional way

            // Collect form data
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
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

    // Logout Button Event Listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            localStorage.removeItem('user'); // Clear any stored data
            window.location.href = './signin.html'; // Redirect to sign-in page
        });
    }

    // Create Form Button Event Listener
    const createFormBtn = document.getElementById('createFormBtn');
    if (createFormBtn) {
        createFormBtn.addEventListener('click', function(event) {
            window.location.href = './CarsForm.html'; // Redirect to CarsForm.html
        });
    }

    // Cars Form Event Listener
    const carsForm = document.getElementById('carsForm');
    if (carsForm) {
        carsForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the form from submitting the traditional way

            // Collect form data
            const carData = {
                name: document.getElementById('name').value,
                lastName: document.getElementById('lastName').value,
                lotNumber: document.getElementById('lotNumber').value,
                carBrand: document.getElementById('carBrand').value,
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

    // Cars Table Population
    const carsTable = document.getElementById('carsTable');
    if (carsTable) {
        fetch('/cars-data')
            .then(response => response.json())
            .then(cars => {
                const tableBody = carsTable.querySelector('tbody');
                tableBody.innerHTML = ''; // Clear existing table data
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
    
    // Edit Car Function
    window.editCar = function(id) {
        window.location.href = `./editCarsForm.html?id=${id}`; // Redirect with the car ID as a query parameter
    };
    
    // Delete Car Function
    window.deleteCar = function(id, element) {
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
                // Remove the car's row from the table
                element.parentElement.parentElement.remove();
            } else {
                alert('Error deleting car');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };
    
    // Check for Edit Car Form and Prefill if Necessary
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id'); // Extract car ID from URL
    if (carId && document.getElementById('editCarsForm')) {
        fetch(`/cars/${carId}`)
            .then(response => response.json())
            .then(car => {
                // Prefill the form with car details for editing
                document.getElementById('name').value = car.name;
                document.getElementById('lastName').value = car.lastName;
                document.getElementById('lotNumber').value = car.lotNumber;
                document.getElementById('carBrand').value = car.carBrand;
            })
            .catch(error => console.error('Error:', error));
    }
});
