import React, { useState, useEffect } from "react";
import ClientList from "./ClientList";
import StatementModal from "./Modals/StatementModal";
import ReprintDocuments from "./Modals/ReprintDocuments";

// ✅ Attach Documents
const AttachDocuments = () => {
  const [files, setFiles] = useState([]);
  const [headers, setHeaders] = useState({});

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow-sm mt-6">
      <h2 className="text-sm font-semibold mb-4 text-slate-700">Client Documents</h2>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm text-slate-600 mb-3"
      />
      {files.length > 0 && (
        <table className="w-full text-sm border-t">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Document</th>
              <th className="py-2">Header</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{file.name}</td>
                <td className="py-2">
                  <input
                    type="text"
                    placeholder="Enter header"
                    value={headers[file.name] || ""}
                    onChange={(e) =>
                      setHeaders({ ...headers, [file.name]: e.target.value })
                    }
                    className="border rounded-lg p-1 text-sm w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ✅ Send Options (fixed)
const SendOptions = ({ setShowStatement, setShowEmailModal }) => (
  <div className="bg-gray-50 p-4 rounded-xl shadow-sm mt-6">
    <h2 className="text-sm font-semibold mb-4 text-slate-700">Actions</h2>
    <div className="flex flex-wrap gap-3">
      <button className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">
        Send via WhatsApp
      </button>
      <button
        onClick={() => setShowEmailModal(true)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
      >
        Send via Email
      </button>
      <button
        onClick={() => setShowStatement(true)}
        className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
      >
        Print Statement
      </button>
    </div>
  </div>
);

// ✅ Floating Button
const FloatingSendButton = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [platform, setPlatform] = useState("");

  const handleSend = () => {
    alert(`Sending via ${platform}: ${message}`);
    setMessage("");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition z-50"
        title="Send SMS / WhatsApp"
      >
        💬
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 text-center">
              Send Message
            </h2>

            <div className="space-y-3">
              <select
                className="border rounded-lg p-2 text-sm w-full bg-white"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="">Select Platform</option>
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>

              <textarea
                placeholder="Enter your message..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border rounded-lg p-2 text-sm w-full bg-white"
              />

              <button
                disabled={!message || !platform}
                onClick={handleSend}
                className="bg-indigo-600 text-white w-full py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:bg-gray-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ✅ Email Modal
const EmailModal = ({ onClose, client }) => {
  const [subject, setSubject] = useState("Customer Statement");
  const [message, setMessage] = useState(
    `Dear ${client?.name || "Customer"},\n\nPlease find attached your statement.\n\nKind regards,\nYour Company`
  );

  const handleSendEmail = () => {
    alert(`Email sent to ${client?.email}\nSubject: ${subject}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 text-center">
          Send Statement via Email
        </h2>

        <div className="space-y-3">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border rounded-lg p-2 text-sm w-full"
          />
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border rounded-lg p-2 text-sm w-full"
          />
          <p className="text-xs text-slate-500">* The statement will be attached as a PDF.</p>

          <button
            onClick={handleSendEmail}
            className="bg-indigo-600 text-white w-full py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Main Component
const ETransact = () => {
  const [showClients, setShowClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showStatement, setShowStatement] = useState(false);

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setShowClients(false);
    localStorage.setItem("selectedClient", JSON.stringify(client));
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("selectedClient"));
    if (stored) setSelectedClient(stored);
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg mt-6 relative">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">🖨️ E-Transact</h2>

      {/* Client Section */}
      <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
        <h2 className="text-sm font-semibold mb-4 text-slate-700">Client Details</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="First Name"
            value={selectedClient?.name || ""}
            className="border rounded-lg p-2 flex-1 text-sm bg-white"
            disabled
          />
          <input
            type="text"
            placeholder="Last Name"
            value={selectedClient?.surname || ""}
            className="border rounded-lg p-2 flex-1 text-sm bg-white"
            disabled
          />
          <input
            type="text"
            placeholder="Email"
            value={selectedClient?.email || ""}
            className="border rounded-lg p-2 flex-1 text-sm bg-white"
            disabled
          />
          <button
            onClick={() => setShowClients(true)}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            {selectedClient ? "Change" : "Search"}
          </button>
        </div>
      </div>

      {/* Actions */}
      <SendOptions setShowStatement={setShowStatement} setShowEmailModal={setShowEmailModal} />
      <AttachDocuments />
      <ReprintDocuments selectedClient={selectedClient} />
      <FloatingSendButton />

      {/* Modals */}
      {showClients && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center w-full max-w-4xl">
            <h2 className="text-xl font-bold mb-4">Client List</h2>
            <ClientList onSelect={handleSelectClient} />
          </div>
        </div>
      )}

      {showStatement && (
        <StatementModal selectedClient={selectedClient} onClose={() => setShowStatement(false)} />
      )}

      {showEmailModal && (
        <EmailModal client={selectedClient} onClose={() => setShowEmailModal(false)} />
      )}
    </div>
  );
};

export default ETransact;
