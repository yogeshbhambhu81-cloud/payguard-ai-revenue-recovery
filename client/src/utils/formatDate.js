export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
};
