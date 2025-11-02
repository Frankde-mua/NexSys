import React, { useState, useEffect } from "react";
import Invoice from "./Invoice";

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  useEffect(() => {
    const storedQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    setQuotes(storedQuotes);
  }, []);

  const handleSaveQuote = (newQuote) => {
    const updatedQuotes = [...quotes, newQuote];
    setQuotes(updatedQuotes);
    localStorage.setItem("quotes", JSON.stringify(updatedQuotes));
    setShowQuoteForm(false);
  };

  const handleEdit = (index) => {
    alert(`Edit quote #${index + 1} (only if not converted to invoice)`);
  };

  // lock body scroll when modal open
  useEffect(() => {
    if (showQuoteForm) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [showQuoteForm]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Quotes</h2>
        <button
          onClick={() => setShowQuoteForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Quote
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-200 p-2 text-left">Quote #</th>
              <th className="border border-gray-200 p-2 text-left">Customer</th>
              <th className="border border-gray-200 p-2 text-left">Date</th>
              <th className="border border-gray-200 p-2 text-left">Total</th>
              <th className="border border-gray-200 p-2 text-left">Status</th>
              <th className="border border-gray-200 p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length > 0 ? (
              quotes.map((quote, index) => (
                <tr key={index}>
                  <td className="border border-gray-200 p-2">
                    #{quote.id || index + 1}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {quote.customer || "N/A"}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {quote.date || new Date().toLocaleDateString()}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {quote.total || "0.00"}
                  </td>
                  <td className="border border-gray-200 p-2 capitalize">
                    {quote.status || "Pending"}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {!quote.converted && (
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-4 text-gray-500 italic"
                >
                  No quotes available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for quote form */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="relative w-[900px] max-w-[95%] h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowQuoteForm(false)}
              className="absolute top-4 right-6 z-20 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>

            {/* Scrollable content */}
            <div className="w-full h-full overflow-y-auto">
              <Invoice mode="quote" onSave={handleSaveQuote} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotes;
