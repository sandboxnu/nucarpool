import { addWeeks, startOfWeek } from "date-fns";

interface ItemWithDate {
  dateCreated: Date;
}
export const filterItemsByDate = (
  items: ItemWithDate[],
  startTimestamp: number,
  endTimestamp: number
) => {
  return items.filter((item) => {
    const itemTimestamp = startOfWeek(item.dateCreated).getTime();
    return itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
  });
};
export const countCumulativeItemsPerWeek = (
  items: ItemWithDate[],
  weekLabels: Date[]
): (number | null)[] => {
  const counts: (number | null)[] = [];
  let cumulativeCount = 0;
  let prevCount = 0;
  let itemIndex = 0;
  const sortedItems = items
    .slice()
    .sort(
      (a, b) =>
        new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
    );

  weekLabels.forEach((weekStart, index) => {
    const weekEnd = addWeeks(weekStart, 1);
    while (
      itemIndex < sortedItems.length &&
      new Date(sortedItems[itemIndex].dateCreated) < weekEnd
    ) {
      cumulativeCount++;
      itemIndex++;
    }

    if (index === 0 || cumulativeCount > prevCount) {
      counts.push(cumulativeCount);
    } else {
      counts.push(null);
    }
    prevCount = cumulativeCount;
  });

  return counts;
};
