document.addEventListener('DOMContentLoaded', function() {
    // Initially load all users and their cars
    loadUsersAndCars();

    // Add event listener for the search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const lotNumber = document.getElementById('searchLotNumber').value;
            if (lotNumber) {
                // If a lot number is entered, perform the search
                searchCarsByLotNumber(lotNumber);
            } else {
                // If the search field is empty, reload all users and their cars
                loadUsersAndCars();
            }
        });
    }
});

function loadUsersAndCars() {
    fetch('/adminDashboard')
    .then(response => handleResponse(response))
    .then(data => updateTableWithUsersAndCars(data))
    .catch(error => handleError(error));
}

function searchCarsByLotNumber(lotNumber) {
    fetch(`/search-cars?lotNumber=${lotNumber}`)
    .then(response => handleResponse(response))
    .then(cars => updateTableWithSearchResults(cars, lotNumber))
    .catch(error => handleError(error));
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

function updateTableWithUsersAndCars(data) {
    const tableBody = document.getElementById('usersCarsTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing table rows
    data.forEach(user => {
        if(user.name != 'admin'){
            if(user.role !== 'admin' && user.cars.length > 0) {
                user.cars.forEach(car => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${car.lotNumber}</td>
                        <td>${car.carBrand}</td>
                        <td><a href="https://www.copart.com/lot/${car.lotNumber}" target="_blank">View Image</a></td>`;
                    tableBody.appendChild(row);
                });
            }
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td colspan="3">No cars registered</td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function updateTableWithSearchResults(cars, lotNumber) {
    const tableBody = document.getElementById('usersCarsTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows
    
    // Insert new rows for each search result
    cars.forEach(car => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${car.user.name}</td>
            <td>${car.user.email}</td>
            <td>${car.lotNumber}</td>
            <td>${car.carBrand}</td>
            <td><a href="https://www.copart.com/lot/${car.lotNumber}" target="_blank">View Image</a></td>
        `;
        tableBody.appendChild(row);
    });

    // If no cars are found, display a message
    if (cars.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5">No cars found for LOT number ${lotNumber}</td>`;
        tableBody.appendChild(row);
    }
}

function handleError(error) {
    console.error('An error occurred:', error);
    alert('An error occurred: ' + error.message);
}
