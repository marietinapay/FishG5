// ================= WORKER FUNCTIONS =================
let editingWorkerId = null;
let workersData = []; // Array to store workers data from database

function handlePictureUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageData = e.target.result;
      document.getElementById('worker-picture').value = imageData;
      displayPicture(imageData);
    };
    reader.readAsDataURL(file);
  }
}

function updatePictureFromUrl() {
  const url = document.getElementById('picture-url-input').value.trim();
  if (url) {
    document.getElementById('worker-picture').value = url;
    displayPicture(url);
  } else {
    alert('Please enter a valid image URL');
  }
}

function displayPicture(source) {
  const preview = document.getElementById('picture-preview');
  preview.classList.add('has-image');
  // Insert an img element with a class so CSS can size it to the preview box
  preview.innerHTML = `<img src="${source}" alt="Worker Picture" class="picture-preview-img" onload="this.parentElement.classList.add('has-image')" onerror="showPictureError()" />`;
}

function showPictureError() {
  alert('Could not load image. Please check the URL or try uploading a file.');
  document.getElementById('picture-preview').classList.remove('has-image');
  document.getElementById('picture-preview').innerHTML = '<i class="fa-solid fa-user"></i>';
  document.getElementById('worker-picture').value = '';
}

function goToHomePage() {
  location.href = 'index.html';
}

function editWorker(workerId) {
  editingWorkerId = workerId;
  
  // Find worker in data
  const worker = workersData.find(w => w.id === workerId);
  if (!worker) return;

  // Populate form with worker data
  document.getElementById('worker-id').value = worker.fisherman_id;
  document.getElementById('worker-name').value = worker.name;
  document.getElementById('worker-age').value = worker.age;
  document.getElementById('worker-joined').value = worker.joined_date;
  document.getElementById('worker-permit').value = worker.permit;
  document.getElementById('worker-similia').value = worker.similia;
  
  if (worker.picture) {
    document.getElementById('worker-picture').value = worker.picture;
    displayPicture(worker.picture);
  }

  // Show update button, hide submit button
  document.getElementById('submit-btn').style.display = 'none';
  document.getElementById('update-btn').style.display = 'inline-flex';
  document.getElementById('cancel-btn').style.display = 'inline-flex';

  // Scroll to form
  document.querySelector('.left-panel').scrollIntoView({ behavior: 'smooth' });
}

function deleteWorker(workerId) {
  if (confirm('Are you sure you want to delete this worker?')) {
    // Send delete request to PHP backend
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', workerId);

    fetch('workers_api.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Worker deleted successfully!');
        loadWorkers(); // Reload the table
      } else {
        alert('Error deleting worker: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error deleting worker');
    });
  }
}

function loadWorkers() {
  // Fetch workers from database
  fetch('workers_api.php?action=list')
    .then(response => response.json())
    .then(data => {
      workersData = data;
      renderWorkersTable(data);
    })
    .catch(error => console.error('Error loading workers:', error));
}

function renderWorkersTable(workers) {
  const tbody = document.getElementById('workers-list');
  tbody.innerHTML = '';

  if (workers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No workers found</td></tr>';
    return;
  }

  workers.forEach(worker => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${worker.fisherman_id}</td>
      <td>${worker.name}</td>
      <td>${worker.age}</td>
      <td>${worker.joined_date}</td>
      <td>${worker.permit}</td>
      <td>${worker.similia}</td>
      <td class="action-buttons">
        <button class="btn-sm btn-edit" onclick="editWorker(${worker.id})" title="Edit"><i class="fa-solid fa-edit"></i></button>
        <button class="btn-sm btn-delete" onclick="deleteWorker(${worker.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function handleWorkerSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData();
  formData.append('action', 'add');
  formData.append('id', document.getElementById('worker-id').value);
  formData.append('name', document.getElementById('worker-name').value);
  formData.append('age', document.getElementById('worker-age').value);
  formData.append('joined_date', document.getElementById('worker-joined').value);
  formData.append('permit', document.getElementById('worker-permit').value);
  formData.append('similia', document.getElementById('worker-similia').value);
  formData.append('picture', document.getElementById('worker-picture').value);

  fetch('workers_api.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Worker added successfully!');
      resetForm();
      loadWorkers();
    } else {
      alert('Error adding worker: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error adding worker');
  });
}

function handleWorkerUpdate(event) {
  event.preventDefault();
  
  const formData = new FormData();
  formData.append('action', 'update');
  formData.append('id', editingWorkerId);
  formData.append('fisherman_id', document.getElementById('worker-id').value);
  formData.append('name', document.getElementById('worker-name').value);
  formData.append('age', document.getElementById('worker-age').value);
  formData.append('joined_date', document.getElementById('worker-joined').value);
  formData.append('permit', document.getElementById('worker-permit').value);
  formData.append('similia', document.getElementById('worker-similia').value);
  formData.append('picture', document.getElementById('worker-picture').value);

  fetch('workers_api.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Worker updated successfully!');
      resetForm();
      loadWorkers();
    } else {
      alert('Error updating worker: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error updating worker');
  });
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  document.getElementById('worker-form').reset();
  document.getElementById('picture-preview').classList.remove('has-image');
  document.getElementById('picture-preview').innerHTML = '<i class="fa-solid fa-user"></i>';
  document.getElementById('submit-btn').style.display = 'inline-flex';
  document.getElementById('update-btn').style.display = 'none';
  document.getElementById('cancel-btn').style.display = 'none';
  editingWorkerId = null;
}

// Load workers when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadWorkers();
});

// ================= LOGOUT =================
function confirmLogout() {
  const ok = confirm('Are you sure you want to logout?');
  if (ok) {
    // Redirect to login page
    location.href = 'login.html';
  }
}

// ================= EXPENSE FUNCTIONS =================
function handleExpenseSubmit(event) {
  event.preventDefault();
  // Add your expense submission logic here
  alert('Expense added successfully!');
  document.getElementById('expense-form').reset();
}

// ================= HARVEST FUNCTIONS =================
function handleHarvestSubmit(event) {
  event.preventDefault();
  // Add your harvest submission logic here
  alert('Harvest added successfully!');
  document.getElementById('harvest-form').reset();
}

// ================= TRANSACTION FUNCTIONS =================
function handleTransactionSubmit(event) {
  event.preventDefault();
  // Add your transaction submission logic here
  alert('Transaction added successfully!');
  document.getElementById('transaction-form').reset();
}
