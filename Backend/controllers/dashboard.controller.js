export const getSMSDashboard = async (req, res) => {
  try {
    let usage = await SmsUsage.findOne();

    if (!usage) {
      usage = await SmsUsage.create({
        totalCredits: 400,
        usedCredits: 0,
        lastRecharge: new Date(),
      });
    }

    const remainingCredits = usage.totalCredits - usage.usedCredits;

    res.json({
      totalCredits: usage.totalCredits,
      usedCredits: usage.usedCredits,
      remainingCredits: remainingCredits,
      lastRecharge: usage.lastRecharge,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching SMS data",
    });
  }
};
