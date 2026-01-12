import React, { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './ReportsAnalytics.module.css';
import "./Dashboard.css";
import { Bar, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReportsAnalytics = () => {
  const { theme } = useOutletContext();
  const reportsRef = useRef(null);

  // Mock Data for Reports & Analytics
  const roomUtilization = {
    overall: '75%',
    peakHours: '10:00 AM - 02:00 PM',
    details: [
      { room: 'Room A', utilization: '85%' },
      { room: 'Room B', utilization: '70%' },
      { room: 'Room C', utilization: '60%' },
    ],
  };

  const roomUtilizationData = {
    labels: roomUtilization.details.map(d => d.room),
    datasets: [{
        label: 'Utilization %',
        data: roomUtilization.details.map(d => parseInt(d.utilization)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  const cancellationRates = {
    overall: '10%',
    byInstructor: [
      { instructor: 'Alice Smith', rate: '5%' },
      { instructor: 'Bob Johnson', rate: '15%' },
    ],
    byRoom: [
      { room: 'Room A', rate: '8%' },
      { room: 'Room C', rate: '12%' },
    ],
  };

  const cancellationByInstructorData = {
    labels: cancellationRates.byInstructor.map(i => i.instructor),
    datasets: [{
        data: cancellationRates.byInstructor.map(i => parseInt(i.rate)),
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
    }]
  };

  const cancellationByRoomData = {
      labels: cancellationRates.byRoom.map(r => r.room),
      datasets: [{
          data: cancellationRates.byRoom.map(r => parseInt(r.rate)),
          backgroundColor: ['rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'],
      }]
  };

  const instructorBookingPatterns = [
    { instructor: 'Alice Smith', avgBookingsPerMonth: 12, mostBookedRoom: 'Room A' },
    { instructor: 'Bob Johnson', avgBookingsPerMonth: 8, mostBookedRoom: 'Room B' },
  ];

  const instructorBookingData = {
    labels: instructorBookingPatterns.map(p => p.instructor),
    datasets: [{
        label: 'Avg Bookings Per Month',
        data: instructorBookingPatterns.map(p => p.avgBookingsPerMonth),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
    }]
  };

  const textColor = theme === 'dark' ? 'white' : '#333';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const barChartOptions = {
      scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } },
      },
      plugins: { legend: { labels: { color: textColor } } },
      maintainAspectRatio: false,
  };

  const doughnutChartOptions = {
      plugins: { legend: { labels: { color: textColor } } },
      maintainAspectRatio: false,
  };

  const exportAsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Section 1: Room Utilization
    csvContent += "Room Utilization\n";
    csvContent += `Overall,${roomUtilization.overall}\n`;
    csvContent += `Peak Hours,${roomUtilization.peakHours}\n`;
    csvContent += "Room,Utilization\n";
    roomUtilization.details.forEach(item => {
        csvContent += `${item.room},${item.utilization}\n`;
    });
    csvContent += "\n";

    // Section 2: Cancellation Rates
    csvContent += "Cancellation Rates\n";
    csvContent += `Overall,${cancellationRates.overall}\n`;
    csvContent += "By Instructor\n";
    csvContent += "Instructor,Rate\n";
    cancellationRates.byInstructor.forEach(item => {
        csvContent += `${item.instructor},${item.rate}\n`;
    });
    csvContent += "By Room\n";
    csvContent += "Room,Rate\n";
    cancellationRates.byRoom.forEach(item => {
        csvContent += `${item.room},${item.rate}\n`;
    });
    csvContent += "\n";

    // Section 3: Instructor Booking Patterns
    csvContent += "Instructor Booking Patterns\n";
    csvContent += "Instructor,Avg Bookings Per Month,Most Booked Room\n";
    instructorBookingPatterns.forEach(item => {
        csvContent += `${item.instructor},${item.avgBookingsPerMonth},${item.mostBookedRoom}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsPDF = () => {
    const input = reportsRef.current;
    if (input) {
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = pdfWidth;
            const height = width / ratio;

            let position = 0;
            let heightLeft = height;

            pdf.addImage(imgData, 'PNG', 0, position, width, height);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
                position = heightLeft - height;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, width, height);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            pdf.save('reports.pdf');
        });
    }
  };

  const handleExport = (format) => {
    if (format === 'CSV') {
        exportAsCSV();
    } else if (format === 'PDF') {
        exportAsPDF();
    }
  };

  return (
    <div className={`${styles.reportsAnalyticsContainer} ${styles[theme]}`}>
      <div ref={reportsRef}>
        <h2 className={styles.sectionTitle}>Reports & Analytics</h2>

        <div className={styles.reportCardGrid}>
          <div className={styles.reportCard}>
            <h3>Room Utilization</h3>
            <p>Overall: <strong>{roomUtilization.overall}</strong></p>
            <p>Peak Hours: <strong>{roomUtilization.peakHours}</strong></p>
            <div className={styles.chartContainer}>
              <Bar data={roomUtilizationData} options={barChartOptions} />
            </div>
          </div>

          <div className={styles.reportCard}>
            <h3>Cancellation Rates</h3>
            <p>Overall: <strong>{cancellationRates.overall}</strong></p>
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
              <div>
                <h4>By Instructor</h4>
                <div className={styles.chartContainer} style={{height: '150px', width: '150px'}}>
                  <Doughnut data={cancellationByInstructorData} options={doughnutChartOptions} />
                </div>
              </div>
              <div>
                <h4>By Room</h4>
                <div className={styles.chartContainer} style={{height: '150px', width: '150px'}}>
                  <Doughnut data={cancellationByRoomData} options={doughnutChartOptions} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.reportCard}>
            <h3>Instructor Booking Patterns</h3>
            <div className={styles.chartContainer}>
              <Bar data={instructorBookingData} options={barChartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.exportButtons}>
        <button className={styles.exportButton} onClick={() => handleExport('CSV')}>Export as CSV</button>
        <button className={styles.exportButton} onClick={() => handleExport('PDF')}>Export as PDF</button>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
