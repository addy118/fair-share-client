import React, { useContext, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { GroupContext } from "@/pages/Group";
import ExpDialog from "./ExpDialog";
import UserPic from "./UserPic";

export default function PaymentHistory() {
  const { history, setSelectedItem, setDetailsOpen } = useContext(GroupContext);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No payment history available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-20">
        <CardHeader>
          <CardTitle>Payments History</CardTitle>
          <CardDescription>All payments in this group</CardDescription>
        </CardHeader>

        <CardContent>
          <ScrollArea className="pr-4">
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatDate(item.timestamp)}
                        </CardDescription>
                      </div>

                      <div className="flex items-center">
                        <span className="mr-2 font-bold">
                          ₹{item.totalAmt.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleExpand(item.id)}
                        >
                          {expandedItems[item.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedItems[item.id] && (
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        {/* payers */}
                        <div className="flex-1">
                          <h4 className="mb-2 text-sm font-medium">Payers</h4>
                          <div className="space-y-2">
                            {item.payers.map((payer, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <UserPic name={payer.payer.name} />
                                  </Avatar>
                                  <span>{payer.payer.name}</span>
                                </div>
                                <span className="font-medium">
                                  ₹{payer.paidAmt.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* balance post pay */}
                        <div className="flex-1">
                          <h4 className="mb-2 text-sm font-medium">
                            Balance After This Transaction
                          </h4>
                          <div className="space-y-2">
                            {item.balance.map((balance, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <UserPic name={balance.user.name} />
                                  </Avatar>
                                  <span>{balance.user.name}</span>
                                </div>
                                {balance.amount > 0 ? (
                                  <span className="font-medium text-green-600">
                                    +₹{balance.amount.toFixed(2)}
                                  </span>
                                ) : balance.amount < 0 ? (
                                  <span className="font-medium text-red-600">
                                    -₹{Math.abs(balance.amount).toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="font-medium">₹0.00</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <ExpDialog />
    </>
  );
}
