export type RootStackParamList = {
  Register: undefined;
  SelectJuice: {
    name: string;
    email: string;
    phone: string;
  };
  Delivery: {
    name: string;
    email: string;
    phone: string;
    selectedJuices: { id: string; name: string; price: number }[];
  };
  Feedback: {
    orderId: string;
  };
};
