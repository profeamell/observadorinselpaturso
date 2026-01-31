import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, Incident } from '../types';
import { LOGO_URL, FULL_INSTITUTION_NAME } from '../constants';

const fetchImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Error Base64"));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("fetchImageAsBase64 error:", error);
    throw error;
  }
};

export const generateStudentFilePDF = async (student: Student, incidents: Incident[], courseName: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  const checkPageOverflow = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  };

  const addHeader = (title: string) => {
    checkPageOverflow(15);
    doc.setFillColor(241, 245, 249);
    doc.rect(20, currentY - 5, pageWidth - 40, 7, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(title, 25, currentY);
    currentY += 10;
  };

  const addField = (label: string, value: any, x: number, y: number, width = 65) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(`${label}:`, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    const val = value ? String(value) : '---';
    const split = doc.splitTextToSize(val, width);
    doc.text(split, x + 35, y);
    return y + (split.length * 4) + 1;
  };

  // 1. Encabezado con Logo e Institución
  try {
    const logoBase64 = await fetchImageAsBase64(LOGO_URL);
    doc.addImage(logoBase64, 'PNG', (pageWidth / 2) - 15, currentY, 30, 30);
    currentY += 35;
  } catch (e) { currentY += 10; }

  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(FULL_INSTITUTION_NAME, pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;

  doc.setFontSize(16);
  doc.setTextColor(37, 99, 235);
  doc.text('FICHA INTEGRAL DEL OBSERVADOR', pageWidth / 2, currentY, { align: 'center' });
  currentY += 12;

  // 2. Información Personal y Familiar
  addHeader('1. IDENTIFICACIÓN Y DATOS FAMILIARES');
  currentY = addField('Nombres', student.firstName, 20, currentY);
  currentY = addField('Apellidos', student.lastName, 20, currentY);
  currentY = addField('Documento', `${student.documentType} ${student.documentId}`, 20, currentY);
  currentY = addField('Fecha Nacimiento', student.birthDate, 20, currentY);
  currentY = addField('Curso Actual', courseName, 20, currentY);
  currentY = addField('Dirección', student.studentAddress, 20, currentY);
  currentY = addField('Teléfono Estudiante', student.studentPhone, 20, currentY);
  currentY = addField('Acudiente Principal', student.guardianName, 20, currentY);
  currentY = addField('Parentesco', student.guardianRelationship, 20, currentY);
  currentY = addField('Teléfono Acudiente', student.guardianPhone, 20, currentY);
  currentY = addField('Número de Hermanos', student.siblingCount, 20, currentY);
  currentY += 5;

  // 3. Salud
  addHeader('2. SALUD Y EMERGENCIA');
  currentY = addField('EPS', student.eps, 20, currentY);
  currentY = addField('Factor RH', student.rhFactor, 20, currentY);
  currentY = addField('Condiciones Médicas', student.medicalConditions, 20, currentY, 130);
  currentY = addField('Formulación Médica', student.medicalFormulation, 20, currentY, 130);
  currentY += 5;

  // 4. Historial Académico
  addHeader('3. ANTECEDENTES Y CRITERIOS ACADÉMICOS');
  currentY = addField('Colegio Anterior', student.previousSchool, 20, currentY);
  currentY = addField('Años Reprobados', student.failedYears, 20, currentY);
  currentY = addField('Motivo Traslado', student.transferReason, 20, currentY, 130);
  currentY = addField('Observaciones Históricas', student.historyObservations, 20, currentY, 130);
  currentY += 5;

  // 5. Intereses y Proyecto
  addHeader('4. INTERESES Y PROYECTO DE VIDA');
  currentY = addField('Materias Favoritas', student.favoriteSubjects, 20, currentY, 130);
  currentY = addField('Dificultades', student.difficultSubjects, 20, currentY, 130);
  currentY = addField('Tiempo Libre', student.freeTimeActivities, 20, currentY, 130);
  currentY = addField('Proyecto de Vida', student.lifeProject, 20, currentY, 130);
  currentY += 10;

  // 6. Seguimiento (Tabla)
  checkPageOverflow(30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(10);
  doc.text('5. SEGUIMIENTO DISCIPLINARIO Y ACADÉMICO', 20, currentY);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Fecha', 'Tipo', 'Periodo', 'Docente', 'Observación']],
    body: incidents.map(i => [
      i.date, 
      i.type, 
      `P${i.period}`, 
      i.registeredByTeacherName, 
      i.observation
    ]),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
    styles: { fontSize: 7 },
    margin: { left: 20, right: 20 },
    columnStyles: {
      4: { cellWidth: 70 }
    }
  });

  doc.save(`Ficha_Integral_${student.lastName}_${student.firstName}.pdf`);
};

export const generateDateRangeReportPDF = async (incidents: Incident[], startDate: string, endDate: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(FULL_INSTITUTION_NAME, pageWidth / 2, 20, { align: 'center' });
  doc.text('REPORTE CONSOLIDADO DE NOVEDADES', pageWidth / 2, 28, { align: 'center' });
  
  autoTable(doc, {
    startY: 35,
    head: [['Curso', 'Estudiante', 'Fecha', 'Tipo', 'Docente', 'Observación']],
    body: incidents.map(i => [
      i.courseName, 
      i.studentName, 
      i.date, 
      i.type, 
      i.registeredByTeacherName,
      i.observation.substring(0, 100) + (i.observation.length > 100 ? '...' : '')
    ]),
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
    styles: { fontSize: 7 }
  });

  doc.save(`Reporte_Novedades_${new Date().toISOString().split('T')[0]}.pdf`);
};
