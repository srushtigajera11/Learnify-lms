import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../public/images/logo.png";


const StudentBilling = () => {

  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);

  useEffect(() => {

    const fetchInvoice = async () => {

      const res = await axiosInstance.get(`/payment/invoice/${id}`);

      setInvoice(res.data.payment);

    };

    fetchInvoice();

  }, [id]);



const downloadPDF = () => {

  const doc = new jsPDF();

  /* ---------- HEADER ---------- */

  doc.addImage(logo, "PNG", 14, 10, 35, 15);

  doc.setFontSize(18);
  doc.setTextColor(40);

  doc.text("INVOICE", 150, 18);

  doc.setFontSize(11);

  doc.text("Learnify LMS", 14, 32);

  doc.setTextColor(100);

  doc.text("Professional Learning Platform", 14, 38);

  doc.setTextColor(0);


  /* ---------- COMPANY INFO ---------- */

  doc.setFontSize(10);

  doc.text("Company Details:", 14, 55);

  doc.text("Learnify LMS Pvt Ltd", 14, 61);

  doc.text("Email: support@learnify.com", 14, 67);

  doc.text("Website: www.learnify.com", 14, 73);


  /* ---------- INVOICE INFO ---------- */

  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 140, 55);

  doc.text(
    `Date: ${new Date(invoice.createdAt).toLocaleDateString()}`,
    140,
    61
  );

  doc.text(`Payment ID: ${invoice.razorpayPaymentId}`, 140, 67);


  /* ---------- BILL TO ---------- */

  doc.setFontSize(11);

  doc.text("Bill To:", 14, 90);

  doc.setFontSize(10);

  doc.text(invoice.userId.name, 14, 96);

  doc.text(invoice.userId.email, 14, 102);


  /* ---------- COURSE TABLE ---------- */

  autoTable(doc, {

    startY: 115,

    head: [

      ["Course", "Qty", "Price"]

    ],

    body: [

      [
        invoice.courseId.title,
        "1",
        `₹ ${invoice.amount / 100}`
      ]

    ],

    styles: {

      fontSize: 10

    },

    headStyles: {

      fillColor: [99, 102, 241]

    },

    columnStyles: {

      2: { halign: "right" }

    }

  });


  /* ---------- TOTAL SECTION ---------- */

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);

  doc.text("Total", 140, finalY);

  doc.text(`₹ ${invoice.amount / 100}`, 170, finalY);


  /* ---------- FOOTER ---------- */

  doc.setFontSize(9);

  doc.setTextColor(120);

  doc.text(
    "Thank you for purchasing from Learnify LMS.",
    14,
    finalY + 20
  );

  doc.text(
    "This is a computer generated invoice.",
    14,
    finalY + 26
  );


  /* ---------- SAVE ---------- */

  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);

};
  if (!invoice)
    return (
      <div className="flex justify-center mt-40">
        <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full"></div>
      </div>
    );


  return (

    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* Success Banner */}

      <div className="max-w-4xl mx-auto mb-6">

        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 shadow-sm">

          <div className="bg-green-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">

            ✓

          </div>

          <div>

            <p className="font-semibold">
              Payment Successful
            </p>

            <p className="text-sm">
              Your enrollment is confirmed and invoice is ready.
            </p>

          </div>

        </div>

      </div>



      {/* Invoice Card */}

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">

        {/* Header */}

        <div className="bg-indigo-600 text-white p-6 flex justify-between items-center">

          <div>

            <h1 className="text-2xl font-bold">
              Learnify LMS
            </h1>

            <p className="text-sm opacity-80">
              Professional Learning Platform
            </p>

          </div>

          <div className="text-right">

            <p className="text-sm opacity-80">
              Invoice
            </p>

            <p className="font-semibold text-lg">

              {invoice.invoiceNumber}

            </p>

          </div>

        </div>



        {/* Body */}

        <div className="p-6 md:p-8">

          {/* Billing Info */}

          <div className="grid md:grid-cols-2 gap-6 mb-8">

            <div>

              <h3 className="font-semibold text-gray-700 mb-2">

                Billed To

              </h3>

              <p className="text-gray-900 font-medium">

                {invoice.userId.name}

              </p>

              <p className="text-gray-500 text-sm">

                {invoice.userId.email}

              </p>

            </div>



            <div className="md:text-right">

              <h3 className="font-semibold text-gray-700 mb-2">

                Payment Details

              </h3>

              <p className="text-sm">

                Payment ID:
                <span className="font-medium text-gray-900">

                  {" "}
                  {invoice.razorpayPaymentId}

                </span>

              </p>

              <p className="text-sm">

                Date:
                <span className="font-medium text-gray-900">

                  {" "}
                  {new Date(invoice.createdAt).toLocaleDateString()}

                </span>

              </p>

            </div>

          </div>



          {/* Table */}

          <div className="border rounded-lg overflow-hidden">

            <div className="bg-gray-100 grid grid-cols-3 p-3 text-sm font-semibold text-gray-600">

              <div>Course</div>

              <div className="text-center">Qty</div>

              <div className="text-right">Price</div>

            </div>



            <div className="grid grid-cols-3 p-4 text-sm border-t">

              <div className="font-medium text-gray-800">

                {invoice.courseId.title}

              </div>

              <div className="text-center">

                1

              </div>

              <div className="text-right">

                ₹{invoice.amount / 100}

              </div>

            </div>

          </div>



          {/* Total */}

          <div className="flex justify-end mt-6">

            <div className="text-right">

              <p className="text-gray-500 text-sm">
                Total
              </p>

              <p className="text-2xl font-bold text-indigo-600">

                ₹{invoice.amount / 100}

              </p>

            </div>

          </div>



          {/* Download button */}

          <div className="mt-8 flex justify-end">

            <button

              onClick={downloadPDF}

              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow font-medium transition"

            >

              Download Receipt

            </button>

          </div>

        </div>



        {/* Footer */}

        <div className="bg-gray-50 text-center text-sm text-gray-500 p-4">

          This is a system generated invoice.  
          Thank you for choosing Learnify 🚀

        </div>

      </div>

    </div>

  );

};

export default StudentBilling;