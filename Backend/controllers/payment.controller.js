export const getFast2SMSRecharge = async (req, res) => {
  res.json({
    rechargeUrl: "https://www.fast2sms.com/dashboard/billing",
  });
};
