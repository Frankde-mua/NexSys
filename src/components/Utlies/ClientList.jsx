import React, { useRef, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
// import Loader from "./Utlies/Loader";

import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  themeQuartz,
  ValidationModule,
  iconSetQuartzLight,
} from "ag-grid-community";
import { RowNumbersModule } from "ag-grid-enterprise";
import { CLIENTS } from "../../data/clients";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  AllCommunityModule,
  RowNumbersModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

const myTheme = themeQuartz.withParams({
  sideBarBackgroundColor: "#08f3",
  sideButtonBarBackgroundColor: "#fff6",
  sideButtonBarTopPadding: 20,
  sideButtonSelectedUnderlineColor: "orange",
  sideButtonTextColor: "#0009",
  sideButtonHoverBackgroundColor: "#fffa",
  sideButtonSelectedBackgroundColor: "#08f1",
  sideButtonHoverTextColor: "#000c",
  sideButtonSelectedTextColor: "#000e",
  sideButtonSelectedBorder: false,
});

export default function ClientList({ onSelect }) {
  const theme = useMemo(() => myTheme, []);
  const [rowData, setRowData] = useState(CLIENTS);
  const [selectedClient, setSelectedClient] = useState(null);
  const gridRef = useRef();

  const columnDefs = useMemo(
    () => [
      { field: "name", headerName: "Name", sortable: true, filter: true },
      { field: "surname", headerName: "Surname", sortable: true, filter: true },
      { field: "type", headerName: "Client Type", sortable: true, filter: true },
      { field: "cell", headerName: "Cell", sortable: true },
      { field: "email", headerName: "Email", sortable: true },
      { field: "address", headerName: "Address", sortable: true, flex: 1 },
      { field: "banking.bank", headerName: "Bank" },
      { field: "banking.accountNumber", headerName: "Account #" },
      { field: "banking.branchCode", headerName: "Branch Code" },
    ],
    []
  );

  const defaultColDef = { resizable: true, flex: 1 };

  const handleRowClick = (event) => {
    onSelect(event.data); // send selected client to parent
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <div
          className="ag-theme-alpine"
          style={{
            width: "100%",
            height: `${50 + rowData.length * 35}px`,
          }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            sideBar={true}
            rowNumbers={true}
            theme={theme}
            headerHeight={50}
            rowHeight={35}
            rowSelection="single" // 👈 Enable single-row selection
            onRowClicked={handleRowClick} // 👈 Capture selected row
          />
        </div>
      </div>

      {/* 👇 Example showing selected client */}
      {selectedClient && (
        <div className="mt-4 bg-indigo-50 p-3 rounded">
          <h2 className="text-lg font-semibold mb-1">Selected Client:</h2>
          <p><strong>{selectedClient.name} {selectedClient.surname}</strong></p>
          <p>{selectedClient.email}</p>
          <p>{selectedClient.cell}</p>

          <button
            onClick={() => {
              // 1️⃣ Log or post the client data
              console.log("Send this client to another page:", selectedClient);

              // 2️⃣ Example: store data in localStorage for use elsewhere
              localStorage.setItem("selectedClient", JSON.stringify(selectedClient));

              // 3️⃣ Example: close the modal if it has an ID (like #clientModal)
              const modal = document.getElementById("clientModal");
              if (modal) modal.style.display = "none"; // or use your modal’s close function

              // 4️⃣ (Optional) Navigate to another page
              // navigate("/billing"); // if using React Router
            }}
            className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Post Data
          </button>
        </div>
      )}
    </div>

  );
}
