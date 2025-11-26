<?php
// Database connection configuration
// Update these with your actual database credentials
$servername = "localhost";
$username = "root";
$password = "";
$database = "fishing_manager";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Set charset to utf8
$conn->set_charset("utf8");

// Handle requests
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

switch($action) {
    case 'list':
        getWorkers();
        break;
    case 'add':
        addWorker();
        break;
    case 'update':
        updateWorker();
        break;
    case 'delete':
        deleteWorker();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getWorkers() {
    global $conn;
    
    $sql = "SELECT id, fisherman_id, name, age, joined_date, permit, similia, picture FROM workers ORDER BY id DESC";
    $result = $conn->query($sql);
    
    $workers = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $workers[] = $row;
        }
    }
    
    echo json_encode($workers);
}

function addWorker() {
    global $conn;
    
    $fisherman_id = isset($_POST['id']) ? $_POST['id'] : '';
    $name = isset($_POST['name']) ? $_POST['name'] : '';
    $age = isset($_POST['age']) ? $_POST['age'] : '';
    $joined_date = isset($_POST['joined_date']) ? $_POST['joined_date'] : '';
    $permit = isset($_POST['permit']) ? $_POST['permit'] : '';
    $similia = isset($_POST['similia']) ? $_POST['similia'] : '';
    $picture = isset($_POST['picture']) ? $_POST['picture'] : '';
    
    // Validate required fields
    if (empty($fisherman_id) || empty($name) || empty($age) || empty($joined_date)) {
        echo json_encode(['success' => false, 'message' => 'Required fields are missing']);
        return;
    }
    
    // Check if fisherman_id already exists
    $check_sql = "SELECT id FROM workers WHERE fisherman_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("s", $fisherman_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Fisherman ID already exists']);
        return;
    }
    
    // Prepare and bind
    $sql = "INSERT INTO workers (fisherman_id, name, age, joined_date, permit, similia, picture) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
        return;
    }
    
    $stmt->bind_param("ssissss", $fisherman_id, $name, $age, $joined_date, $permit, $similia, $picture);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Worker added successfully', 'id' => $stmt->insert_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Execute failed: ' . $stmt->error]);
    }
    
    $stmt->close();
}

function updateWorker() {
    global $conn;
    
    $id = isset($_POST['id']) ? $_POST['id'] : '';
    $name = isset($_POST['name']) ? $_POST['name'] : '';
    $age = isset($_POST['age']) ? $_POST['age'] : '';
    $joined_date = isset($_POST['joined_date']) ? $_POST['joined_date'] : '';
    $permit = isset($_POST['permit']) ? $_POST['permit'] : '';
    $similia = isset($_POST['similia']) ? $_POST['similia'] : '';
    $picture = isset($_POST['picture']) ? $_POST['picture'] : '';
    
    // Validate required fields
    if (empty($id) || empty($name) || empty($age) || empty($joined_date)) {
        echo json_encode(['success' => false, 'message' => 'Required fields are missing']);
        return;
    }
    
    // Prepare and bind
    $sql = "UPDATE workers SET name = ?, age = ?, joined_date = ?, permit = ?, similia = ?, picture = ? WHERE fisherman_id = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
        return;
    }
    
    $stmt->bind_param("ssissss", $name, $age, $joined_date, $permit, $similia, $picture, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Worker updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Execute failed: ' . $stmt->error]);
    }
    
    $stmt->close();
}

function deleteWorker() {
    global $conn;
    
    $id = isset($_POST['id']) ? $_POST['id'] : '';
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'Worker ID is missing']);
        return;
    }
    
    // Prepare and bind
    $sql = "DELETE FROM workers WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
        return;
    }
    
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Worker deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Execute failed: ' . $stmt->error]);
    }
    
    $stmt->close();
}

$conn->close();
?>
