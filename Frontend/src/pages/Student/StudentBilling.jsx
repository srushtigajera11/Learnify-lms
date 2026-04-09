import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";

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

    doc.text("Learnify Invoice", 20, 20);

    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 20, 40);

    doc.text(`Course: ${invoice.courseId.title}`, 20, 60);

    doc.text(`Amount: ₹${invoice.amount / 100}`, 20, 80);

    doc.text(`Payment ID: ${invoice.razorpayPaymentId}`, 20, 100);

    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 120);

    doc.save("invoice.pdf");

  };

  if (!invoice) return <p>Loading...</p>;

  return (

    <div className="p-10">

      <h2 className="text-2xl font-bold mb-5">

        Payment Successful 🎉

      </h2>

      <div className="bg-white shadow-md p-6 rounded">

        <p><b>Invoice:</b> {invoice.invoiceNumber}</p>

        <p><b>Course:</b> {invoice.courseId.title}</p>

        <p><b>Amount:</b> ₹{invoice.amount / 100}</p>

        <p><b>Status:</b> {invoice.status}</p>

        <p><b>Payment Id:</b> {invoice.razorpayPaymentId}</p>

        <p><b>Date:</b>
          {new Date(invoice.createdAt).toLocaleDateString()}
        </p>

        <button

          onClick={downloadPDF}

          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
        >

          Download Receipt

        </button>

      </div>

    </div>

  );

};

export default StudentBilling;