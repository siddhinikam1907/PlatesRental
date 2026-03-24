export const calculateRent = (plates, ratePerPlate, totalDays) => {
  const monthDays = 30;

  // ✅ Ensure totalDays is a valid positive number
  if (!totalDays || totalDays <= 0) return 0;

  // ✅ Convert to integer days (avoid fractional issues)
  totalDays = Math.ceil(totalDays);

  let totalAmount = 0;

  const fullMonths = Math.floor(totalDays / monthDays);
  const remainingDays = totalDays % monthDays;

  // ✅ Full months rent
  totalAmount += fullMonths * monthDays * plates * ratePerPlate;

  // ✅ Remaining days logic
  if (remainingDays > 0) {
    if (remainingDays <= 5) {
      totalAmount += remainingDays * plates * ratePerPlate;
    } else {
      totalAmount += monthDays * plates * ratePerPlate;
    }
  }

  return totalAmount;
};
