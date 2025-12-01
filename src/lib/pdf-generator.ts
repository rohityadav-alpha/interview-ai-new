import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Question {
  question: string;
  userAnswer: string;
  aiScore: number;
  aiFeedback: string;
  strengths?: string[];      // ✅ ADD
  improvements?: string[];    // ✅ ADD
  confidenceTips?: string[];  // ✅ ADD
}

interface ReportData {
  userName: string;
  userEmail: string;
  skill: string;
  difficulty: string;
  totalScore: number;
  avgScore: number;
  questionsAttempted: number;
  createdAt: string;
  questions: Question[];
}

export function generatePDFReport(data: ReportData): boolean {
  try {
    console.log('📄 Starting PDF generation...');
    
    const doc = new jsPDF();
    
    const primaryColor: [number, number, number] = [37, 99, 235];
    const successColor: [number, number, number] = [22, 163, 74];
    const textColor: [number, number, number] = [31, 41, 55];
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Interview AI', 105, 18, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Interview Performance Report', 105, 30, { align: 'center' });
    
    doc.setTextColor(...textColor);
    
    let yPos = 50;
    
    // Candidate Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Candidate Information', 20, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Name: ${data.userName || 'N/A'}`, 20, yPos);
    yPos += 6;
    doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })}`, 20, yPos);
    yPos += 12;
    
    // Interview Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Interview Details', 20, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Skill: ${data.skill}`, 20, yPos);
    yPos += 6;
    doc.text(`Difficulty: ${data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1)}`, 20, yPos);
    yPos += 6;
    doc.text(`Questions Attempted: ${data.questionsAttempted}/${data.questions.length}`, 20, yPos);
    yPos += 12;
    
    // Score Summary
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(...successColor);
    doc.setLineWidth(0.5);
    doc.rect(20, yPos, 170, 30, 'FD');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...successColor);
    doc.text('Performance Summary', 105, yPos + 10, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Total Score: ${data.totalScore}`, 50, yPos + 22);
    doc.text(`Average Score: ${Number(data.avgScore).toFixed(1)}/10`, 120, yPos + 22);
    
    yPos += 40;
    doc.setTextColor(...textColor);
    
    const avgScore = Number(data.avgScore);
    let performanceText = '';
    let performanceColor: [number, number, number] = textColor;
    
    if (avgScore >= 8) {
      performanceText = 'Excellent Performance!';
      performanceColor = [22, 163, 74];
    } else if (avgScore >= 6) {
      performanceText = 'Good Performance';
      performanceColor = [37, 99, 235];
    } else if (avgScore >= 4) {
      performanceText = 'Average Performance';
      performanceColor = [245, 158, 11];
    } else {
      performanceText = 'Needs Improvement';
      performanceColor = [239, 68, 68];
    }
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...performanceColor);
    doc.text(`Overall: ${performanceText}`, 20, yPos);
    yPos += 10;
    doc.setTextColor(...textColor);
    
    // ✅ DETAILED QUESTIONS WITH ALL FIELDS
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Question-wise Feedback', 20, yPos);
    yPos += 8;
    
    // Loop through each question
    data.questions.forEach((q, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Question number and text
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`Question ${index + 1}:`, 20, yPos);
      yPos += 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      const questionLines = doc.splitTextToSize(q.question, 170);
      doc.text(questionLines, 20, yPos);
      yPos += (questionLines.length * 5) + 5;
      
      // Score badge
      if (q.aiScore) {
        const scoreColor: [number, number, number] = q.aiScore >= 8 ? [22, 163, 74] : q.aiScore >= 6 ? [37, 99, 235] : [239, 68, 68];
        doc.setFillColor(...scoreColor);
        doc.roundedRect(20, yPos, 25, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`${q.aiScore}/10`, 32.5, yPos + 5.5, { align: 'center' });
        yPos += 12;
      }
      
      doc.setTextColor(...textColor);
      
      // Your Answer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Answer:', 20, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      const answerLines = doc.splitTextToSize(q.userAnswer || 'No answer provided', 170);
      doc.text(answerLines, 20, yPos);
      yPos += (answerLines.length * 5) + 5;
      
      // AI Feedback
      if (q.aiFeedback) {
        doc.setFont('helvetica', 'bold');
        doc.text('AI Feedback:', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        const feedbackLines = doc.splitTextToSize(q.aiFeedback, 170);
        doc.text(feedbackLines, 20, yPos);
        yPos += (feedbackLines.length * 5) + 5;
      }
      
      // ✅ Strengths
      if (q.strengths && q.strengths.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 163, 74);
        doc.text('Strengths:', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        q.strengths.forEach((strength) => {
          const strengthLines = doc.splitTextToSize(`• ${strength}`, 165);
          doc.text(strengthLines, 25, yPos);
          yPos += (strengthLines.length * 5);
        });
        yPos += 3;
      }
      
      // ✅ Improvements
      if (q.improvements && q.improvements.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(245, 158, 11);
        doc.text('Areas for Improvement:', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        q.improvements.forEach((improvement) => {
          const improvementLines = doc.splitTextToSize(`• ${improvement}`, 165);
          doc.text(improvementLines, 25, yPos);
          yPos += (improvementLines.length * 5);
        });
        yPos += 3;
      }
      
      // ✅ Confidence Tips
      if (q.confidenceTips && q.confidenceTips.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(147, 51, 234);
        doc.text('Confidence Tips:', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        q.confidenceTips.forEach((tip) => {
          const tipLines = doc.splitTextToSize(`• ${tip}`, 165);
          doc.text(tipLines, 25, yPos);
          yPos += (tipLines.length * 5);
        });
        yPos += 3;
      }
      
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, 190, yPos);
      yPos += 8;
    });
    
    // Footer on each page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        'Generated by Interview AI',
        105,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
    }
    
    const filename = `Interview_Report_${data.skill.replace(/\s+/g, '_')}_${new Date(data.createdAt).toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    console.log('✅ PDF generated successfully:', filename);
    return true;
    
  } catch (error: any) {
    console.error('❌ PDF generation error:', error);
    return false;
  }
}
