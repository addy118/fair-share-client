const groupData = (data) => {
  return {
    id: data.id,
    name: data.name,
    memberCount: data.members.length,
    expenses: data.expenses,
    totalExpenses: data.expenses.reduce((sum, exp) => sum + exp.totalAmt, 0),
    members: data.members.map(({ member }) => ({
      id: member.id,
      name: member.name,
      username: member.username,
    })),
    createdAt: data.createdAt,
  };
};

const balanceData = (data, userId) => {
  return data.map(({ user, amount }) => ({
    userId: user.id,
    name: user.name,
    balance: amount,
    isCurrentUser: user.id === userId,
  }));
};

const format = { groupData, balanceData };
export default format;
