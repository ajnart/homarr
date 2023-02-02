export const isToday = (date: Date) => {
  const today = new Date();
  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    date.getFullYear() === date.getFullYear()
  );
};
