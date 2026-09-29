export const SERVICE_PRICES = {
  'Car Inspection & Checks': 500,
  'Car Electronic Services': 1200,
  'Air Conditioning Service': 1500,
  'Car Engine Service': 3500,
  'Car Brake Service': 1800,
  'Headlight & Bulb Check': 400,
  'General Repair Service': 2500,
  'Car Tyre Service': 1000,
};

export const calculateServiceCost = (selectedOrDesc) => {
  if (!selectedOrDesc) return 0;

  // If array of selected service options
  if (Array.isArray(selectedOrDesc)) {
    return selectedOrDesc.reduce((sum, item) => sum + (SERVICE_PRICES[item] || 0), 0);
  }

  // If description string e.g. "Car Engine Service, Car Brake Service"
  let total = 0;
  Object.entries(SERVICE_PRICES).forEach(([serviceName, price]) => {
    if (selectedOrDesc.includes(serviceName)) {
      total += price;
    }
  });
  return total;
};
