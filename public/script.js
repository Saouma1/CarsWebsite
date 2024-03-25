document.addEventListener('DOMContentLoaded', function() {
    
    fetch('/getUserName')
    .then(response => response.json())
    .then(data => {
        const userNameDisplay = document.getElementById('userName');
        if (userNameDisplay) {
            userNameDisplay.textContent = data.userName;
        }
    })
    .catch(error => console.error('Error fetching user name:', error));
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
            .then(response => {
                if (response.ok) {
                    return response.json(); // For a successful request, parse the JSON
                } else {
                    // If the response is not ok, handle it as an error
                    return response.text().then(text => { throw new Error(text); });
                }
            })
            .then(data => {
                console.log('Car saved:', data);
                window.location.href = './welcome.html'; // Redirect back to welcome page
            })
            .catch((error) => {
                console.error('Error:', error);
                const errorContainer = document.getElementById('errorContainer');
                errorContainer.textContent = error.message; // Use the message from the server
                errorContainer.style.display = 'block'; // Make sure the container is visible
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
    
    const editCarsForm = document.getElementById('editCarsForm');
    if (editCarsForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const carId = urlParams.get('id'); // Extract car ID from URL
        
        if (carId) {
            editCarsForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent the form from submitting the traditional way
                
                // Collect form data
                const carData = {
                    name: document.getElementById('name').value,
                    lastName: document.getElementById('lastName').value,
                    lotNumber: document.getElementById('lotNumber').value,
                    carBrand: document.getElementById('carBrand').value,
                };

                // Send a PUT request to the backend
                fetch(`/cars/${carId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(carData),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok.');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Car updated:', data);
                    window.location.href = './welcome.html'; // Redirect back to welcome page
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            });

            // Prefill the form with car details for editing
            fetch(`/cars/${carId}`)
                .then(response => response.json())
                .then(car => {
                    document.getElementById('name').value = car.name;
                    document.getElementById('lastName').value = car.lastName;
                    document.getElementById('lotNumber').value = car.lotNumber;
                    document.getElementById('carBrand').value = car.carBrand;
                })
                .catch(error => console.error('Error:', error));
        } else {
            console.error('Car ID is missing from the URL.');
        }
    }
});

