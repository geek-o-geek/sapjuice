export type RootStackParamList = {
  Register: { mode?: 'signIn' } | undefined;
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
    orderedJuices?: { id: string; name: string }[];
    pointsEarned?: number;
    pointsUsed?: number;
  };
  OrderTracking: {
    orderId: string;
  };
  Reviews: undefined;
};
