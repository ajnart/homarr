export const calculateETA = (givenSeconds: number) => {
  // If its superior than one day return > 1 day
  if (givenSeconds > 86400) {
    return '> 1 day';
  }
  // Transform the givenSeconds into a readable format. e.g. 1h 2m 3s
  const hours = Math.floor(givenSeconds / 3600);
  const minutes = Math.floor((givenSeconds % 3600) / 60);
  const seconds = Math.floor(givenSeconds % 60);
  // Only show hours if it's greater than 0.
  const hoursString = hours > 0 ? `${hours}h ` : '';
  const minutesString = minutes > 0 ? `${minutes}m ` : '';
  const secondsString = seconds > 0 ? `${seconds}s` : '';
  return `${hoursString}${minutesString}${secondsString}`;
};
