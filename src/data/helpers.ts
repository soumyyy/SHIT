const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const getTodayDayOfWeek = (): number => {
  const today = new Date();
  const day = today.getDay();
  // Date.getDay(): 0 = Sunday ... 6 = Saturday. Convert to 0 = Monday.
  return day === 0 ? 6 : day - 1;
};

export const getDayLabel = (dayOfWeek: number): string => DAYS[dayOfWeek] ?? "Day";

export const formatTimeRange = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours);
  startDate.setMinutes(minutes);

  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
};
