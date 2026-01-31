
-- ==========================================================
-- SCRIPT DE INICIALIZACIÓN PARA TURSO (libSQL)
-- URL: libsql://observadorinselpa-javamell.aws-us-east-1.turso.io
-- PROYECTO: OBSERVADOR DIGITAL INSELPA
-- ==========================================================

-- Habilitar claves foráneas
PRAGMA foreign_keys = ON;

-- 1. TABLA DE USUARIOS (Acceso al sistema)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('ADMIN', 'TEACHER')) NOT NULL,
    name TEXT NOT NULL
);

-- 2. TABLA DE DOCENTES (Personal registrado para incidencias)
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    document_id TEXT UNIQUE
);

-- 3. TABLA DE CURSOS
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 4. TABLA DE TIPOS DE FALTAS
CREATE TABLE IF NOT EXISTS fault_types (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL
);

-- 5. TABLA DE ESTUDIANTES (Ficha Integral)
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL UNIQUE,
    document_type TEXT NOT NULL,
    course_id TEXT NOT NULL,
    photo_base64 TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date TEXT,
    student_phone TEXT,
    student_address TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    guardian_relationship TEXT,
    sibling_count INTEGER DEFAULT 0,
    eps TEXT,
    rh_factor TEXT,
    medical_conditions TEXT,
    medical_formulation TEXT,
    failed_years TEXT,
    previous_school TEXT,
    transfer_reason TEXT,
    history_observations TEXT,
    favorite_subjects TEXT,
    difficult_subjects TEXT,
    free_time_activities TEXT,
    life_project TEXT,
    director_id TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 6. TABLA DE INCIDENCIAS (Observador)
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    type TEXT CHECK(type IN ('Académica', 'Disciplinaria')) NOT NULL,
    fault_type_id TEXT,
    date TEXT NOT NULL,
    follow_up INTEGER DEFAULT 0,
    period TEXT CHECK(period IN ('1', '2', '3', '4')) NOT NULL,
    observation TEXT NOT NULL,
    evidence_base64 TEXT,
    registered_by_teacher_id TEXT NOT NULL,
    registered_by_teacher_name TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (fault_type_id) REFERENCES fault_types(id)
);

-- ==========================================================
-- INSERCIÓN DE DATOS MAESTROS (SEEDS)
-- ==========================================================

-- Usuario Administrador Inicial
INSERT OR IGNORE INTO users (id, username, password, role, name) 
VALUES ('u1', 'admin', '1122', 'ADMIN', 'Administrador General');

-- Lista de Docentes Inicial
INSERT OR IGNORE INTO teachers (id, name, document_id) VALUES 
('t1', 'Juan Pérez', '10901234'), 
('t2', 'María Rodríguez', '10905678'), 
('t3', 'Andrés Mendoza', '10909012');

-- Cursos Iniciales
INSERT OR IGNORE INTO courses (id, name) VALUES 
('c1', '1001'), 
('c2', '1002'), 
('c3', '1101'), 
('c4', '1102');

-- Tipos de Faltas
INSERT OR IGNORE INTO fault_types (id, type) VALUES 
('f1', 'Falta Tipo I'), 
('f2', 'Falta Tipo II'), 
('f3', 'Falta Tipo III'), 
('f4', 'Observación');
