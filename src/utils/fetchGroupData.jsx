import api from "@/axiosInstance";
import format from "./formatGroup";

export const fetchGroupData = async (groupId, userId) => {
  const [groupRes, balancesRes, expensesRes, historyRes] = await Promise.all([
    api.get(`/grp/${groupId}/info`),
    api.get(`/grp/${groupId}/balance`),
    api.get(`/grp/${groupId}/expenses`),
    api.get(`/grp/${groupId}/history`),
  ]);

  const groupData = format.groupData(groupRes.data);
  const balanceData = format.balanceData(balancesRes.data, userId);
  const settlementsData = format.settlementsData(expensesRes.data.splits);

  return {
    group: groupData,
    balances: balanceData,
    expenses: expensesRes.data,
    settlements: settlementsData,
    history: historyRes.data,
  };
};

export const fetchGroup = async (groupId) => {
  const response = await api.get(`/grp/${groupId}/info`);
  const groupData = format.groupData(response.data);
  return groupData;
};

export const fetchBalances = async (groupId, userId) => {
  const response = await api.get(`/grp/${groupId}/balance`);
  const balanceData = format.balanceData(response.data, userId);
  return balanceData;
};

export const fetchExpensesAndSettlments = async (groupId) => {
  const response = await api.get(`/grp/${groupId}/expenses`);
  const expensesData = response.data;
  const settlementsData = format.settlementsData(expensesData.splits);
  return { expensesData, settlementsData };
};

export const fetchHistory = async (groupId) => {
  const response = await api.get(`/grp/${groupId}/history`);
  return response.data;
};

[
  {
    type: "expense",
    timestamp: "2025-04-08T03:31:51.221Z",
    id: 2,

    
    name: "exp2",
    totalAmt: 50,
    createdAt: "2025-04-08T03:31:51.221Z",
    payers: [
      {
        payer: {
          id: 3,
          name: "Hagrid",
        },
        paidAmt: 50,
      },
      {
        payer: {
          id: 2,
          name: "Hermione",
        },
        paidAmt: 0,
      },
    ],
  },

  {
    type: "split",
    timestamp: "2025-04-10T16:11:55.202Z",
    id: 25,

    debtor: {
      id: 2,
      name: "Hermione",
    },
    creditor: {
      id: 3,
      name: "Hagrid",
    },
    amount: 25,
    updatedAt: "2025-04-10T16:11:55.202Z",
  },
];
