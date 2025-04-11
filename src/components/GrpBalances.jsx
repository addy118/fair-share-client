import React, { useContext, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { GroupContext } from "@/pages/Group";
import UserPic from "./UserPic";
import { Avatar } from "./ui/avatar";
import { fetchBalances } from "@/utils/fetchGroupData";
import { useParams } from "react-router-dom";
import { useAuth } from "@/authProvider";

export default function GrpBalances() {
  const { id: groupId } = useParams();
  const { user } = useAuth();
  const { group, balances, setBalances } = useContext(GroupContext);
  const members = group?.members;
  // console.log(members);

  // refresh balance
  useEffect(() => {
    const refreshBalances = async () => {
      const newBalance = await fetchBalances(groupId);
      setBalances(newBalance);
    };
    refreshBalances();
  }, [groupId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Balances</CardTitle>
        <CardDescription>Current balance for each member</CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-4">
          {balances.length == 0
            ? members?.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <UserPic name={member.name} />
                    </Avatar>
                    <span>{member.name}</span>
                    {member.id == user.id && (
                      <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                        You
                      </span>
                    )}
                  </div>
                  <span className="font-medium">₹0.00</span>
                </li>
              ))
            : balances.map((balance) => (
                <li
                  key={balance.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <UserPic name={balance.name} />
                    </Avatar>
                    <span>{balance.name}</span>
                    {balance.isCurrentUser && (
                      <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                        You
                      </span>
                    )}
                  </div>
                  {balance.balance > 0 ? (
                    <span className="font-medium text-green-600">
                      +₹{balance.balance.toFixed(2)}
                    </span>
                  ) : balance.balance < 0 ? (
                    <span className="font-medium text-red-600">
                      -₹{Math.abs(balance.balance).toFixed(2)}
                    </span>
                  ) : (
                    <span className="font-medium">₹0.00</span>
                  )}
                </li>
              ))}
        </ul>
      </CardContent>
    </Card>
  );
}
