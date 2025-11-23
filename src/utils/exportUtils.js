import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ------------------ Tickets ------------------

// Export tickets to PDF
export const exportTicketsToPDF = (tickets, filename = 'tickets') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Bus Ticket Report', 14, 22);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Prepare table data
  const tableData = tickets.map(ticket => [
    ticket.ticket_number,
    ticket.route_number,
    `${ticket.origin} → ${ticket.destination}`,
    ticket.passenger_name || 'N/A',
    ticket.passenger_type,
    `Rs. ${parseFloat(ticket.fare_amount).toFixed(2)}`,
    new Date(ticket.ticket_date).toLocaleDateString(),
  ]);

  doc.autoTable({
    head: [['Ticket No.', 'Route', 'Journey', 'Passenger', 'Type', 'Fare', 'Date']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [102, 126, 234] },
  });

  // Add summary
  const totalRevenue = tickets.reduce((sum, t) => sum + parseFloat(t.fare_amount), 0);
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text(`Total Tickets: ${tickets.length}`, 14, finalY);
  doc.text(`Total Revenue: Rs. ${totalRevenue.toFixed(2)}`, 14, finalY + 8);

  doc.save(`${filename}.pdf`);
};

// Export tickets to Excel
export const exportTicketsToExcel = (tickets, filename = 'tickets') => {
  const worksheetData = [
    ['Ticket Number', 'Route', 'Origin', 'Destination', 'Passenger Name', 'Type', 'Seat', 'Fare', 'Payment', 'Date'],
    ...tickets.map(ticket => [
      ticket.ticket_number,
      ticket.route_number,
      ticket.origin,
      ticket.destination,
      ticket.passenger_name || 'N/A',
      ticket.passenger_type,
      ticket.seat_number || 'N/A',
      parseFloat(ticket.fare_amount).toFixed(2),
      ticket.payment_method,
      new Date(ticket.ticket_date).toLocaleString(),
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');

  const totalRevenue = tickets.reduce((sum, t) => sum + parseFloat(t.fare_amount), 0);
  const summaryData = [
    ['Summary'],
    ['Total Tickets', tickets.length],
    ['Total Revenue', totalRevenue.toFixed(2)],
    ['Average Fare', tickets.length > 0 ? (totalRevenue / tickets.length).toFixed(2) : '0.00'],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// ------------------ Statistics ------------------

// Export statistics to PDF
export const exportStatisticsToPDF = (stats, date, filename = 'statistics') => {
  const doc = new jsPDF();

  // Convert object counts to numbers to avoid React/JS issues
  const totalTickets = typeof stats.totalTickets === 'object' ? stats.totalTickets.count || 0 : stats.totalTickets || 0;
  const totalRevenue = typeof stats.totalRevenue === 'object' ? stats.totalRevenue.total || 0 : stats.totalRevenue || 0;

  doc.setFontSize(18);
  doc.text('Daily Statistics Report', 14, 22);
  doc.setFontSize(12);
  doc.text(`Date: ${date}`, 14, 30);

  let yPos = 40;

  // Overview
  doc.setFontSize(14);
  doc.text('Overview', 14, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.text(`Total Tickets: ${totalTickets}`, 14, yPos);
  yPos += 7;
  doc.text(`Total Revenue: Rs. ${parseFloat(totalRevenue).toFixed(2)}`, 14, yPos);
  yPos += 15;

  // Tickets by Type
  if (stats.ticketsByType?.length) {
    doc.setFontSize(14);
    doc.text('Tickets by Passenger Type', 14, yPos);
    yPos += 10;

    const typeData = stats.ticketsByType.map(item => [
      item.passenger_type,
      item.count.toString(),
    ]);

    doc.autoTable({
      head: [['Type', 'Count']],
      body: typeData,
      startY: yPos,
      styles: { fontSize: 10 },
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Tickets by Route
  if (stats.ticketsByRoute?.length) {
    doc.setFontSize(14);
    doc.text('Tickets by Route', 14, yPos);
    yPos += 10;

    const routeData = stats.ticketsByRoute.map(item => [
      `Route ${item.route_number}`,
      item.count.toString(),
    ]);

    doc.autoTable({
      head: [['Route', 'Count']],
      body: routeData,
      startY: yPos,
      styles: { fontSize: 10 },
    });
  }

  doc.save(`${filename}.pdf`);
};
