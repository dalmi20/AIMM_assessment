import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Answer, UserInfo } from '@/hooks/useQuestionnaire';

interface ExportData {
  userInfo: UserInfo;
  role: string;
  answers: Answer[];
  totalQuestions: number;
  completionPercentage: number;
}

export function generatePDF(data: ExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Couleurs
  const primaryColor: [number, number, number] = [66, 133, 244]; // Bleu
  const accentColor: [number, number, number] = [244, 67, 54]; // Rouge
  const textColor: [number, number, number] = [33, 33, 33]; // Gris foncé
  const lightGray: [number, number, number] = [240, 240, 240]; // Gris clair

  // En-tête
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Grille de Maturité', 20, 25);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Collaboration Logistique', 20, 33);

  yPosition = 50;

  // Section Informations du participant
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations du Participant', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const infoData = [
    ['Entreprise', data.userInfo.company || 'N/A'],
    ['Prénom', data.userInfo.firstName || 'N/A'],
    ['Nom', data.userInfo.lastName || 'N/A'],
    ['Rôle', data.role || 'N/A'],
    ['Date d\'export', new Date().toLocaleDateString('fr-FR')],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Champ', 'Valeur']],
    body: infoData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: textColor,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Section Résumé
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé de Complétion', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const summaryData = [
    ['Total de questions', data.totalQuestions.toString()],
    ['Questions répondues', data.answers.length.toString()],
    ['Taux de complétion', `${data.completionPercentage}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Métrique', 'Valeur']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: textColor,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Vérifier si on a besoin d'une nouvelle page
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  // Section Réponses détaillées
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Réponses Détaillées', 20, yPosition);

  yPosition += 10;

  // Grouper les réponses par dimension
  const answersByDimension: Record<string, Answer[]> = {};
  data.answers.forEach((answer) => {
    if (!answersByDimension[answer.dimension]) {
      answersByDimension[answer.dimension] = [];
    }
    answersByDimension[answer.dimension].push(answer);
  });

  // Afficher chaque dimension avec ses réponses
  Object.entries(answersByDimension).forEach(([dimension, answers]) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(dimension, 20, yPosition);

    yPosition += 8;

    // Tableau des réponses pour cette dimension
    const dimensionAnswersData = answers.map((answer) => [
      answer.indicator,
      answer.question.substring(0, 50) + (answer.question.length > 50 ? '...' : ''),
      answer.selectedText.substring(0, 30) + (answer.selectedText.length > 30 ? '...' : ''),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Indicateur', 'Question', 'Réponse']],
      body: dimensionAnswersData,
      theme: 'grid',
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: textColor,
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: textColor,
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 70 },
        2: { cellWidth: 60 },
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  });

  // Pied de page
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Télécharger le PDF
  const fileName = `questionnaire-${data.userInfo.lastName || 'export'}_${data.userInfo.firstName || ''}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export function generatePDFBase64(data: ExportData): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor: [number, number, number] = [66, 133, 244];
  const textColor: [number, number, number] = [33, 33, 33];
  const lightGray: [number, number, number] = [240, 240, 240];
  let yPosition = 20;

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Grille de Maturité', 20, 25);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Collaboration Logistique', 20, 33);

  yPosition = 50;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations du Participant', 20, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Champ', 'Valeur']],
    body: [
      ['Entreprise', data.userInfo.company || 'N/A'],
      ['Prénom', data.userInfo.firstName || 'N/A'],
      ['Nom', data.userInfo.lastName || 'N/A'],
      ['Rôle', data.role || 'N/A'],
      ['Date', new Date().toLocaleDateString('fr-FR')],
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { textColor },
    alternateRowStyles: { fillColor: lightGray },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  const answersByDimension: Record<string, Answer[]> = {};
  data.answers.forEach((answer) => {
    if (!answersByDimension[answer.dimension]) answersByDimension[answer.dimension] = [];
    answersByDimension[answer.dimension].push(answer);
  });

  Object.entries(answersByDimension).forEach(([dimension, dimAnswers]) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(66, 133, 244);
    doc.text(dimension, 20, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [['Indicateur', 'Question', 'Réponse']],
      body: dimAnswers.map((a) => [
        a.indicator,
        a.question.substring(0, 50) + (a.question.length > 50 ? '...' : ''),
        a.selectedText.substring(0, 30) + (a.selectedText.length > 30 ? '...' : ''),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [200, 200, 200] as [number,number,number], textColor, fontStyle: 'bold' },
      bodyStyles: { textColor, fontSize: 9 },
      alternateRowStyles: { fillColor: lightGray },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 70 }, 2: { cellWidth: 60 } },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  });

  return doc.output('datauristring').split(',')[1];
}