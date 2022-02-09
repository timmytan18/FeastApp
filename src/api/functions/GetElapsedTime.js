function getElapsedTime(timestamp) {
  const d = new Date();
  const diffInSeconds = ((d.getTime() - Date.parse(timestamp)) / 1000 | 0);
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }
  if (diffInSeconds < 3600) {
    return `${(diffInSeconds / 60 | 0)}m`;
  }
  if (diffInSeconds < 86400) {
    return `${(diffInSeconds / 3600 | 0)}h`;
  }
  if (diffInSeconds < 604800) {
    return `${(diffInSeconds / 86400 | 0)}d`;
  }
  if (diffInSeconds < 315360000) {
    return `${(diffInSeconds / 604800 | 0)}w`;
  }
  return '';
}

export default getElapsedTime;
