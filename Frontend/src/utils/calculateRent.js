export const calculateRent = (plates, ratePerPlate, totalDays) => {
  const monthDays = 30;

  if (!totalDays || totalDays <= 0) return 0;

  totalDays = Math.ceil(totalDays);

  let totalAmount = 0;

  const fullMonths = Math.floor(totalDays / monthDays);
  const remainingDays = totalDays % monthDays;

  totalAmount += fullMonths * monthDays * plates * ratePerPlate;

  if (remainingDays > 0) {
    if (remainingDays <= 5) {
      totalAmount += remainingDays * plates * ratePerPlate;
    } else {
      totalAmount += monthDays * plates * ratePerPlate;
    }
  }

  return totalAmount;
};
