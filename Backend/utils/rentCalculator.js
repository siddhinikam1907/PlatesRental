export const calculateRent = (plates, ratePerPlate, totalDays) => {
  const monthDays = 30;

  let totalAmount = 0;

  const fullMonths = Math.floor(totalDays / monthDays);
  const remainingDays = totalDays % monthDays;

  // full months rent
  totalAmount += fullMonths * monthDays * plates * ratePerPlate;

  // remaining days rule
  if (remainingDays <= 5) {
    totalAmount += remainingDays * plates * ratePerPlate;
  } else {
    // charge one full month for remaining days >5
    totalAmount += monthDays * plates * ratePerPlate;
  }

  return totalAmount;
};
