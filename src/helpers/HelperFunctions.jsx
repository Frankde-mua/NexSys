// src/helpers/HelperFunctions.jsx
export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function handleLogoutHelper({
  setLoaderLabel,
  setLoading,
  setUser,
  setCurrentPage,
}) {
  setLoaderLabel("Logging out...");
  setLoading(true);
  setTimeout(() => {
    localStorage.removeItem("user");
    setUser(null);
    setCurrentPage("dashboard");
    setLoaderLabel("NexSys");
    setLoading(false);
  }, 1200);
}
