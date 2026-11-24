import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Loader from "./Utlies/Loader";
import ClientDropdown from "./Utlies/ClientDropdown";
import {
  getAllStatus,
  getAllAgendas,
  saveNewAgenda,
  saveNewStatus,
  deleteStatus,
  deleteAgenda,
  updateAgenda,
} from "./Utlies/Helpers/HelperFunctions";

export default function Calendar({
  current,
  setCurrent,
  selectedDate,
  setSelectedDate,
  startOfMonth,
  endOfMonth,
  addDays,
  formatISO,
}) {
  const [events, setEvents] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [newAgenda, setNewAgenda] = useState({
    name: "",
    surname: "",
    title: "",
    time: "00:00",
    status_id: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [agendaDate, setAgendaDate] = useState("");

  const monthLabel = useMemo(
    () => current.toLocaleString(undefined, { month: "long", year: "numeric" }),
    [current]
  );

  const monthGrid = useMemo(() => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    const startDay = start.getDay();
    const daysInMonth = end.getDate();
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    const firstCellDate = addDays(start, -startDay);
    return Array.from({ length: totalCells }, (_, i) =>
      addDays(firstCellDate, i)
    );
  }, [current]);

  const goMonth = (offset) =>
    setCurrent((c) => new Date(c.getFullYear(), c.getMonth() + offset, 1));

  // --- Fetch statuses and events on mount ---
  useEffect(() => {
    const fetchData = async () => {
      setStatuses(await getAllStatus());
      setEvents(await getAllAgendas());
      //setTest(await getAllAgendas());
    };
    fetchData();
  }, []);

  // --- Open Agenda Modal ---
  const handleOpenAgendaModal = (isoDate) => {
    const localDate = new Date(
      new Date(isoDate).setDate(new Date(isoDate).getDate() + 1)
    );
    const dateFormatted = localDate.toLocaleDateString("en-CA");
    setAgendaDate(dateFormatted);
    setNewAgenda({ title: "", time: "00:00", status_id: "" });
    setIsEditing(false);
    setEditingEventId(null);
    setShowAgendaModal(true);
  };

  // --- Save Agenda to backend ---
  const handleSaveAgenda = async () => {
    await saveNewAgenda(
      newAgenda,
      agendaDate,
      setEvents,
      setLoading,
      setShowAgendaModal
    );
    setIsEditing(false);
    setEditingEventId(null);
  };

  // --- Update Agenda (edit mode) ---
  const handleUpdateAgenda = async () => {
    await updateAgenda(
      newAgenda,
      agendaDate,
      editingEventId,
      setEvents,
      setLoading,
      setShowAgendaModal
    );
    setIsEditing(false);
    setEditingEventId(null);
    setStatuses(await getAllStatus());
  };

  // --- Save status to backend ---
  const handleSaveStatus = async () => {
    await saveNewStatus(newStatus, setStatuses, setLoading, () => {
      setNewStatus("");
    });
    setShowStatusModal(false);
  };

  const handleDeleteStatus = async ({ statusId, status_desc }) => {
    await deleteStatus(statusId, status_desc, setStatuses);
  };

  const updateEvent = (event) => {
    setIsEditing(true);
    setEditingEventId(event.id);
    setNewAgenda({
      name: event.name,
      surname: event.surname,
      title: event.title,
      time: event.time || "00:00",
      status_id: event.status_id || ""
    });
    setAgendaDate(new Date(
      new Date(event.date).setDate(new Date(event.date).getDate() + 1)
    ));
    setShowAgendaModal(true);
  };

  const removeEvent = async ({ id }) => {
    await deleteAgenda(id, setEvents);
  };

  const agendaForSelected = events.filter((e) => e.date === selectedDate);

  return (
    <div>
      {/* Loader */}
      <Loader
        show={loading}
        label={isEditing ? "Updating agenda..." : "Adding agenda..."}
        style={{ fontSize: "0.870rem" }}
      />

      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-sm text-slate-600">
            Keep track of agendas and orders.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-2">
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">{monthLabel}</div>
              <div className="space-x-1">
                <button
                  onClick={() => goMonth(-1)}
                  className="text-xs px-2 py-1 rounded hover:bg-slate-100"
                >
                  Prev
                </button>
                <button
                  onClick={() => goMonth(1)}
                  className="text-xs px-2 py-1 rounded hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs text-slate-500 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center font-medium">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-sm">
              {monthGrid.map((d) => {
                const iso = formatISO(d);
                const inMonth = d.getMonth() === current.getMonth();
                const dayEvents = events.filter((e) => e.date === iso);
                const isSelected = selectedDate === iso;
                return (
                  <div
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className={`p-2 rounded-lg cursor-pointer min-h-[64px] border ${
                      isSelected
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-transparent"
                    } ${inMonth ? "" : "text-slate-400 opacity-60"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-medium">{d.getDate()}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAgendaModal(iso);
                        }}
                        className="text-[10px] px-1 py-0.5 rounded bg-slate-100 hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="text-[10px] bg-indigo-100 rounded px-1 py-0.5 truncate"
                        >
                          {e.status_desc}
                          <br/>
                          {e.status}
                          {e.time ? `${e.title} • ${e.time} ` : ""}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-slate-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-1 bg-white p-3 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">
              Agenda — {selectedDate}
            </div>
            <button
              onClick={() => setSelectedDate(formatISO(new Date()))}
              className="text-xs px-2 py-1 rounded hover:bg-slate-100"
            >
              Today
            </button>
          </div>

          {agendaForSelected.length === 0 ? (
            <div className="text-sm text-slate-500">
              No events. Click a date to add one.
            </div>
          ) : (
            <ul className="space-y-2">
              {agendaForSelected.map((e) => (
                <li
                  key={e.id}
                  className="p-2 border rounded flex justify-between items-start"
                >
                  <div>
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-sm font-medium">{e.status_desc}</div>
                    <div className="text-sm font-medium">{e.name} {e.surname}</div>
                    <div className="text-xs text-slate-500">
                      {e.time || "00:00"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => updateEvent(e)}
                      className="text-orange-500 text-xs"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => removeEvent({ id: e.id })}
                      className="text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* --- New / Edit Agenda Modal --- */}
      {showAgendaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-5 rounded-xl shadow-lg w-80"
          >
            <h2 className="text-lg font-semibold mb-3">
              {isEditing ? "Edit Agenda" : "New Agenda"}
            </h2>

            {!isEditing && (
  <ClientDropdown
    onSelectClient={(client) => {
      setNewAgenda({ ...newAgenda, client });
    }}
  />
)}

{isEditing && newAgenda.client && (
  <div className="mb-4">
    <label className="block text-sm mb-1">Client</label>
    <div className="w-full border rounded px-2 py-1 text-sm bg-slate-100 text-slate-600 cursor-not-allowed">
      {newAgenda.client.name} {newAgenda.client.surname}
    </div>
  </div>
)}


            <label className="block text-sm mb-1">Title</label>
            <input
              type="text"
              value={newAgenda.title}
              onChange={(e) =>
                setNewAgenda({ ...newAgenda, title: e.target.value })
              }
              className="w-full border rounded px-2 py-1 mb-2 text-sm"
              placeholder="Enter title"
            />

            <label className="block text-sm mb-1">Time (HH:MM)</label>
            <div className="flex items-center gap-1 mb-2">
              <input
                type="text"
                maxLength="2"
                value={newAgenda.time.split(":")[0]}
                onChange={(e) =>
                  setNewAgenda({
                    ...newAgenda,
                    time: `${e.target.value || "00"}:${
                      newAgenda.time.split(":")[1]
                    }`,
                  })
                }
                className="w-10 border rounded px-1 py-1 text-center text-sm"
              />
              <span>:</span>
              <input
                type="text"
                maxLength="2"
                value={newAgenda.time.split(":")[1]}
                onChange={(e) =>
                  setNewAgenda({
                    ...newAgenda,
                    time: `${newAgenda.time.split(":")[0]}:${
                      e.target.value || "00"
                    }`,
                  })
                }
                className="w-10 border rounded px-1 py-1 text-center text-sm"
              />
            </div>

            {/* Status Dropdown */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Status</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowStatusDropdown((prev) => !prev)
                  }
                  className="w-full border rounded px-2 py-1 text-sm flex justify-between items-center"
                >
                  {newAgenda.status_id
                    ? statuses.find(
                        (s) => s.id === newAgenda.status_id
                      )?.status_desc
                    : "Select status"}
                  <span className="ml-2">▾</span>
                </button>

                {showStatusDropdown && (
                  <div className="absolute w-full mt-1 bg-white border rounded shadow max-h-48 overflow-y-auto z-20">
                    {statuses.map((s) => (
                      <div
                        key={s.id}
                        className="flex justify-between items-center px-2 py-1 hover:bg-slate-100 text-sm cursor-pointer"
                      >
                        <span
                          onClick={() => {
                            setNewAgenda({
                              ...newAgenda,
                              status_id: s.id,
                            });
                            setShowStatusDropdown(false);
                          }}
                        >
                          {s.status_desc}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStatus({
                              statusId: s.id,
                              status_desc: s.status_desc,
                            });
                          }}
                          className="text-red-500 text-xs ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <div
                      onClick={() => {
                        setShowStatusModal(true);
                        setShowStatusDropdown(false);
                      }}
                      className="px-2 py-1 text-sm text-indigo-500 hover:bg-indigo-50 cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={14} /> Add new status
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAgendaModal(false)}
                className="px-3 py-1 text-sm rounded bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={isEditing ? handleUpdateAgenda : handleSaveAgenda}
                className="px-3 py-1 text-sm rounded bg-indigo-500 text-white"
              >
                {isEditing ? "Update" : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- New Status Modal --- */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-5 rounded-xl shadow-lg w-72"
          >
            <h2 className="text-lg font-semibold mb-3">New Status</h2>
            <input
              type="text"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder="Enter status name"
              className="w-full border rounded px-2 py-1 mb-3 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-3 py-1 text-sm rounded bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-3 py-1 text-sm rounded bg-indigo-500 text-white"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
