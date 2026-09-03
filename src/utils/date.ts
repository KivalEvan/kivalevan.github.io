const monthName = [
   'January',
   'February',
   'March',
   'April',
   'May',
   'June',
   'July',
   'August',
   'September',
   'October',
   'November',
   'December',
];

interface DateParts {
   day: number;
   month: number;
   year: number;
}

function getDateParts(input: string | Date): DateParts {
   if (typeof input === 'string') {
      const value = input.trim();
      const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (isoDate) {
         return {
            day: Number(isoDate[3]),
            month: Number(isoDate[2]) - 1,
            year: Number(isoDate[1]),
         };
      }

      const namedDate = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(value);
      if (namedDate) {
         const month = monthName.findIndex(
            (name) => name.toLowerCase() === namedDate[2].toLowerCase(),
         );
         if (month >= 0) {
            return {
               day: Number(namedDate[1]),
               month,
               year: Number(namedDate[3]),
            };
         }
      }

      const frontmatterDate =
         /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/.exec(value);
      if (frontmatterDate) {
         const month = monthName.findIndex(
            (name) => name.toLowerCase() === frontmatterDate[1].toLowerCase(),
         );
         if (month >= 0) {
            return {
               day: Number(frontmatterDate[2]),
               month,
               year: Number(frontmatterDate[3]),
            };
         }
      }
   }

   const date = input instanceof Date ? input : new Date(input);
   return {
      day: date.getUTCDate(),
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
   };
}

export function formatDate(input: string | Date) {
   const { day, month, year } = getDateParts(input);
   return `${day} ${monthName[month]} ${year}`;
}

export function formatISODate(input: string | Date) {
   const { day, month, year } = getDateParts(input);
   return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
