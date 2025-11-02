import axios from "axios";

// --- Get saved company name from localStorage ---
export const getCompanyName = () => {
  const saved = JSON.parse(localStorage.getItem("user"));
  return saved?.company_name?.toLowerCase();
};

// --- Fetch all statuses ---
export const getAllStatus = async () => {
  const companyName = getCompanyName();
  //https://franklin-unsprinkled-corrie.ngrok-free.dev/api/status/${companyName}
  try {
    const res = await axios.get(`http://localhost:5000/api/status/${companyName}`,
      { headers: { "ngrok-skip-browser-warning": "true" } }
    );
    return res.data.statuses || [];
  } catch (err) {
    console.error("Error fetching statuses:", err);
    return [];
  }
};

// --- Fetch all agendas ---
export const getAllAgendas = async () => {
  const companyName = getCompanyName();
  //https://franklin-unsprinkled-corrie.ngrok-free.dev/api/calendar/${companyName}
  try {
    const res = await axios.get(`http://localhost:5000/api/calendar/${companyName}`,
      { headers: { "ngrok-skip-browser-warning": "true" } }
    );

    const dbEvents = res.data.entries.map((e) => ({
      id: e.id,
      title: e.agenda,
      date: new Date(e.date).toISOString().slice(0, 10),
      time: e.time?.slice(0, 5) || "00:00",
      status_id: e.status_id,
      status_desc: e.status_desc,
      client_id: e.client_id || null,
      name: e.name || e.firstname || "",
      surname: e.surname || e.surename || "",
    }));

    return dbEvents || [];
  } catch (err) {
    console.error("Error fetching agendas:", err);
    return [];
  }
};

// --- Save new status ---
export const saveNewStatus = async (newStatus, setStatuses, setLoading) => {
    const companyName = getCompanyName();
    if (!newStatus.trim()) return alert("Enter a status description");
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/status/${companyName}`,
        { status_desc: newStatus },
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      if (res.data.success) {
        setStatuses(prev => [...prev, res.data.status]);
        console.log("Posted successful");
      }
    } catch (err) { 
        console.error(err);
     } finally{
        setLoading(false);
     }
  };

// --- Save new agenda ---
export const saveNewAgenda = async (
  newAgenda,
  agendaDate,
  setEvents,
  setLoading,
  setShowAgendaModal
) => {
  if (!newAgenda.title) return alert("Please enter a title");

  const companyName = getCompanyName();
  setLoading(true);
  // `https://franklin-unsprinkled-corrie.ngrok-free.dev/api/calendar/${companyName}
  try {
    const res = await axios.post(`http://localhost:5000/api/calendar/${companyName}`,
      {
        agenda: newAgenda.title,
        time: newAgenda.time,
        status_id: newAgenda.status_id || null,
        client_id: newAgenda.client?.id || null, // ✅ Added client_id
        date: agendaDate,
      },
      { headers: { "ngrok-skip-browser-warning": "true" } }
    );

    if (res.data.success) {
      const e = res.data.agenda;
      setEvents((ev) =>
        [
          ...ev,
          {
            id: e.id,
            title: e.agenda,
            date: new Date(e.date).toISOString().slice(0, 10),
            time: e.time?.slice(0, 5) || "00:00",
            status_id: e.status_id,
            status_desc: e.status_desc,
            client_id: e.client_id || null,
            name: e.name || e.firstname || "",
            surname: e.surname || e.surename || "",
          },
        ].sort((a, b) => a.date.localeCompare(b.date))
      );
    } else {
      alert("Failed to save agenda");
    }
  } catch (err) {
    console.error(err);
    alert("Error saving agenda");
  } finally {
    setLoading(false);
    setShowAgendaModal(false);
  }
};

// --- Update agenda ---
export const updateAgenda = async (
  newAgenda,
  agendaDate,
  editingEventId,
  setEvents,
  setLoading,
  setShowAgendaModal
) => {
  const companyName = getCompanyName();
  try {
    setLoading(true);

    // Destructure and exclude client/client_id so they’re not sent
    // `https://franklin-unsprinkled-corrie.ngrok-free.dev/api/calendar/${companyName}/${editingEventId`
    const { client, client_id, ...agendaData } = newAgenda;

    const res = await axios.put(
      `http://localhost:5000/api/calendar/${companyName}/${editingEventId}`,
      { ...agendaData, date: agendaDate }
    );
    if (res.data.success) {
      setShowAgendaModal(false);
      const dbEvents = res.data.entries.map((e) => ({
      id: e.id,
      title: e.agenda,
      date: new Date(e.date).toISOString().slice(0, 10),
      time: e.time?.slice(0, 5) || "00:00",
      status_id: e.status_id,
      status_desc: e.status_desc,
      client_id: e.client_id || null,
      name: e.name || e.firstname || "",
      surname: e.surname || e.surename || "",
    }));

    setEvents(dbEvents);
    }
  } catch (err) {
    console.error("Error updating agenda:", err);
  } finally {
    setLoading(false);
  }
};

// --- Delete status ---
export const deleteStatus = async (statusId, statusDesc, setStatuses) => {
    const confirmed = confirm(`Please note status can only be deleted if it's not used in the diary.\nAre you sure you want to delete "${statusDesc}"?`);
  if (!confirmed) return;
  const companyName = getCompanyName();
  try {
    const res = await axios.delete(
      `http://localhost:5000/api/status/${companyName}/${statusId}`,
      { headers: { "ngrok-skip-browser-warning": "true" } }
    );

    if (res.data.success) {
      setStatuses((prev) => prev.filter((s) => s.id !== statusId));
    } else {
      alert(res.data.message || "Cannot delete status");
    }
  } catch (err) {
    console.error(err);
  }
};

// --- Remove event ---
export const deleteAgenda = async (id, setEvents) => {
  if (!confirm("Remove this event?")) return;

  const companyName = getCompanyName();

  try {
    await axios.delete(
      `http://localhost:5000/api/calendar/${companyName}/${id}`,
      { headers: { "ngrok-skip-browser-warning": "true" } }
    );
    setEvents((ev) => ev.filter((e) => e.id !== id));
  } catch (err) {
    console.error(err);
  }
};
