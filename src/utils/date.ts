const date = new Date();

const monthName = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(input: string | Date) {
  const date = input instanceof Date ? input : new Date(input);
  return `${date.getUTCDate()} ${
    monthName[date.getMonth()]
  } ${date.getFullYear()}`;
}

export const currentDate = `${date.getUTCDate()} ${
  monthName[date.getMonth()]
} ${date.getFullYear()}`;
