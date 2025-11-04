// utils/billingUtils.js
export const BILLING_SERVICES = [
  { id: 1, code: "11001", name: "Optometric Examination", price: 651.84 },
  { id: 2, code: "11046", name: "Ocular Pathology Examination", price: 733.18 },
  { id: 3, code: "11061", name: "Low Vision Examination", price: 903.98 },
  { id: 4, code: "11141", name: "Refractive Status Evaluation ", price: 236.88 },
  { id: 5, code: "11501", name: "Dispensing Fee ", price: 90.40 },
  { id: 6, code: "11521", name: "Dispensing Fee ", price: 120.49 },
  { id: 7, code: "81BS001", name: "Single Vision (standard) CR39 lens", price: 251.67 },
  { id: 8, code: "84BS001", name: "Bifocals CR39 lens", price: 633.02 },
  { id: 9, code: "40501", name: "Spectacle Frame", price: 1035.29 }
];


export const DUMMY_TARIFFS = [
  { id: 1, code: "TAR001", desc: "Eye Test", fee: 200 },
  { id: 2, code: "TAR002", desc: "Spectacle Frame", fee: 800 },
  { id: 3, code: "TAR003", desc: "Lens Fitting", fee: 400 },
];

export const blankRow = () => ({
  id: Math.random().toString(36).slice(2, 9),
  tariff: "",
  tariffCode: "",
  qty: 1,
  narrative: "",
  discount: 0,
  fee: 0,
  lens: "None",
  barcode: "",
  stockLink: null,
});
