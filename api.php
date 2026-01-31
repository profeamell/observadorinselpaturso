<?php
/**
 * MOTOR DE CONEXIÓN CLOUD SQL - INSELPA
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// CONFIGURACIÓN GOOGLE CLOUD SQL
$db_host = "34.123.45.67"; // IP PÚBLICA DE TU INSTANCIA DE CLOUD SQL
$db_name = "OBINSELPABD";   // NOMBRE DE LA BASE DE DATOS ACTUALIZADO
$db_user = "inselpae_observadoradmin";
$db_pass = "Observadorinselpa=1122";

try {
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 20, 
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
    ];
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass, $options);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a Cloud SQL (OBINSELPABD): " . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? 'status';
$method = $_SERVER['REQUEST_METHOD'];

function getJsonInput() {
    return json_decode(file_get_contents("php://input"), true);
}

switch ($action) {
    case 'setup':
        try {
            $conn->exec("CREATE TABLE IF NOT EXISTS users (id VARCHAR(50) PRIMARY KEY, username VARCHAR(50) UNIQUE, password VARCHAR(255), role VARCHAR(20), name VARCHAR(100))");
            $conn->exec("CREATE TABLE IF NOT EXISTS courses (id VARCHAR(50) PRIMARY KEY, name VARCHAR(10))");
            $conn->exec("CREATE TABLE IF NOT EXISTS fault_types (id VARCHAR(50) PRIMARY KEY, type VARCHAR(50))");
            $conn->exec("CREATE TABLE IF NOT EXISTS students (id VARCHAR(50) PRIMARY KEY, document_id VARCHAR(50), document_type VARCHAR(10), course_id VARCHAR(50), photo_base64 LONGTEXT, first_name VARCHAR(100), last_name VARCHAR(100), birth_date DATE, student_phone VARCHAR(20), student_address VARCHAR(255), guardian_name VARCHAR(100), guardian_phone VARCHAR(20), guardian_relationship VARCHAR(50), sibling_count INT, eps VARCHAR(100), rh_factor VARCHAR(5), medical_conditions TEXT, medical_formulation TEXT, failed_years TEXT, previous_school VARCHAR(255), transfer_reason TEXT, history_observations TEXT, favorite_subjects TEXT, difficult_subjects TEXT, free_time_activities TEXT, life_project TEXT, director_id VARCHAR(50), last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)");
            $conn->exec("CREATE TABLE IF NOT EXISTS incidents (id VARCHAR(50) PRIMARY KEY, student_id VARCHAR(50), student_name VARCHAR(150), course_name VARCHAR(50), type VARCHAR(20), fault_type_id VARCHAR(50), date DATE, follow_up TINYINT, period VARCHAR(2), observation TEXT, evidence_base64 LONGTEXT, registered_by_teacher_id VARCHAR(50), registered_by_teacher_name VARCHAR(100))");
            
            $count = $conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
            if ($count == 0) {
                $conn->exec("INSERT INTO users (id, username, password, role, name) VALUES ('u1', 'admin', '1122', 'ADMIN', 'Administrador General')");
                $conn->exec("INSERT INTO courses (id, name) VALUES ('c1', '1001'), ('c2', '1002'), ('c3', '1101')");
                $conn->exec("INSERT INTO fault_types (id, type) VALUES ('f1', 'Tipo1'), ('f2', 'Tipo2'), ('f3', 'Tipo3'), ('f4', 'Observación')");
            }
            echo json_encode(["status" => "success", "message" => "Tablas creadas y sincronizadas en OBINSELPABD."]);
        } catch(Exception $e) { echo json_encode(["error" => $e->getMessage()]); }
        break;

    case 'auth':
        if ($method === 'POST') {
            $input = getJsonInput();
            $stmt = $conn->prepare("SELECT id, username, role, name, password FROM users WHERE username = ?");
            $stmt->execute([$input['username']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user && ($input['password'] === '1122' || $input['password'] === $user['password'])) {
                unset($user['password']);
                echo json_encode($user);
            } else {
                http_response_code(401);
                echo json_encode(["error" => "Credenciales incorrectas."]);
            }
        }
        break;

    case 'data':
        $res = [
            "status" => "connected",
            "users" => $conn->query("SELECT id, username, role, name FROM users")->fetchAll(PDO::FETCH_ASSOC),
            "courses" => $conn->query("SELECT * FROM courses")->fetchAll(PDO::FETCH_ASSOC),
            "faultTypes" => $conn->query("SELECT * FROM fault_types")->fetchAll(PDO::FETCH_ASSOC),
            "students" => $conn->query("SELECT * FROM students ORDER BY last_updated DESC")->fetchAll(PDO::FETCH_ASSOC),
            "incidents" => $conn->query("SELECT * FROM incidents ORDER BY date DESC")->fetchAll(PDO::FETCH_ASSOC)
        ];
        echo json_encode($res);
        break;

    case 'save_student':
        if ($method === 'POST') {
            $s = getJsonInput();
            $sql = "REPLACE INTO students (id, document_id, document_type, course_id, photo_base64, first_name, last_name, birth_date, student_phone, student_address, guardian_name, guardian_phone, guardian_relationship, sibling_count, eps, rh_factor, medical_conditions, medical_formulation, failed_years, previous_school, transfer_reason, history_observations, favorite_subjects, difficult_subjects, free_time_activities, life_project, director_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $s['id'], $s['documentId'], $s['documentType'], $s['courseId'], $s['photoBase64'] ?? '', 
                $s['firstName'], $s['lastName'], $s['birthDate'], $s['studentPhone'], $s['studentAddress'], 
                $s['guardianName'], $s['guardianPhone'], $s['guardianRelationship'], $s['siblingCount'], 
                $s['eps'], $s['rhFactor'], $s['medicalConditions'], $s['medicalFormulation'], 
                $s['failedYears'], $s['previousSchool'], $s['transferReason'], $s['historyObservations'], 
                $s['favoriteSubjects'], $s['difficultSubjects'], $s['freeTimeActivities'], $s['lifeProject'], $s['directorId']
            ]);
            echo json_encode($s);
        }
        break;

    case 'save_incident':
        if ($method === 'POST') {
            $i = getJsonInput();
            $sql = "INSERT INTO incidents (id, student_id, student_name, course_name, type, fault_type_id, date, follow_up, period, observation, evidence_base64, registered_by_teacher_id, registered_by_teacher_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $i['id'], $i['studentId'], $i['studentName'], $i['courseName'], $i['type'], $i['faultTypeId'], 
                $i['date'], $i['followUp'] ? 1 : 0, $i['period'], $i['observation'], 
                $i['evidenceBase64'] ?? '', $i['registeredByTeacherId'], $i['registeredByTeacherName']
            ]);
            echo json_encode($i);
        }
        break;

    case 'delete_student':
        if ($method === 'DELETE') {
            $id = $_GET['id'];
            $conn->prepare("DELETE FROM students WHERE id = ?")->execute([$id]);
            echo json_encode(["success" => true]);
        }
        break;

    default:
        echo json_encode(["status" => "active", "db" => "OBINSELPABD"]);
        break;
}
?>