import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import useGroupData from "@/utils/useGroup";
import api from "@/axiosInstance";
import Loading from "@/components/Loading";

export default function ExpenseForm() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { group } = useGroupData(Number(groupId));
  const users = group?.members || [];

  const [expenseName, setExpenseName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [payers, setPayers] = useState([
    { id: Date.now(), payerId: "", amount: "" },
  ]);
  const [payersTotal, setPayersTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  // calculate total whenever payers change
  useEffect(() => {
    const total = payers.reduce((sum, payer) => {
      return sum + (Number.parseFloat(payer.amount) || 0);
    }, 0);
    setPayersTotal(total);
  }, [payers]);

  const addPayer = () => {
    setPayers([...payers, { id: Date.now(), payerId: "", amount: "" }]);
  };

  const removePayer = (id) => {
    if (payers.length > 1) {
      setPayers(payers.filter((payer) => payer.id !== id));
    }
  };

  const updatePayer = (id, field, value) => {
    setPayers(
      payers.map((payer) =>
        payer.id === id ? { ...payer, [field]: value } : payer
      )
    );
  };

  const handleCreateExpense = async (expense) => {
    // in a real app, you would send this to your api
    try {
      setLoading(true);
      await api.post("/exp/new", expense, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // console.log("Creating expense:", expense);
      setLoading(false);
      alert("Expense submitted successfully!");
      navigate(`/groups/${Number(groupId)}`);
    } catch (err) {
      console.error("Failed to create an expense: ", err);
    }

    // Navigate back to group page after successful submission
    // navigate(`/groups/${groupId}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!expenseName.trim()) {
      alert("Please enter an expense name");
      return;
    }

    if (!totalAmount || Number.parseFloat(totalAmount) < 0) {
      alert("Please enter a valid total amount");
      return;
    }

    const invalidPayers = payers.some(
      (payer) => !payer.payerId || !payer.amount
    );
    if (invalidPayers) {
      alert("Please fill in all payer details");
      return;
    }

    if (Math.abs(Number.parseFloat(totalAmount) - payersTotal) > 0.01) {
      alert(
        `Payer amounts total (${payersTotal.toFixed(
          2
        )}) doesn't match expense total (${Number.parseFloat(
          totalAmount
        ).toFixed(2)})`
      );
      return;
    }

    const expense = {
      name: expenseName,
      totalAmt: Number.parseFloat(totalAmount),
      payers: payers.map(({ payerId, amount }) => ({
        payerId: Number(payerId),
        amount: Number.parseFloat(amount),
      })),
      groupId,
    };

    handleCreateExpense(expense);
  };

  return (
    <div className="mx-auto mb-20 max-w-xl px-4">
      <h1 className="mb-4 text-2xl font-bold">Create Expense</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create New Expense</CardTitle>
          <CardDescription>
            Add a new expense with multiple payers
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* expense name */}
            <div className="space-y-2">
              <Label htmlFor="expense-name">Expense Name</Label>
              <Input
                id="expense-name"
                placeholder="Dinner, Groceries, Movie tickets, etc."
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                required
              />
            </div>

            {/* total amount */}
            <div className="space-y-2">
              <Label htmlFor="total-amount">Total Amount</Label>
              <Input
                id="total-amount"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={totalAmount}
                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                onChange={(e) => setTotalAmount(e.target.value)}
                required
              />
            </div>

            {/* dynamic payers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Payers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPayer}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Payer
                </Button>
              </div>

              {payers.map((payer) => (
                <div key={payer.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`payer-${payer.id}`}>Payer</Label>
                    <div className="mt-1">
                      <Select
                        value={payer.payerId}
                        onValueChange={(value) =>
                          updatePayer(payer.id, "payerId", value)
                        }
                        required
                      >
                        <SelectTrigger id={`payer-${payer.id}`}>
                          <SelectValue placeholder="Select a payer" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem
                              key={user.id}
                              value={user.id.toString()}
                            >
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex-1">
                    <Label htmlFor={`amount-${payer.id}`}>Amount</Label>
                    <Input
                      id={`amount-${payer.id}`}
                      type="number"
                      step="1"
                      min="0"
                      placeholder="0"
                      value={payer.amount}
                      onChange={(e) =>
                        updatePayer(payer.id, "amount", e.target.value)
                      }
                      required
                      className="mt-1 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePayer(payer.id)}
                    disabled={payers.length === 1}
                    className="mt-6"
                  >
                    <Trash className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}

              <div className="flex justify-between pt-2 text-sm">
                <span>Payers Total:</span>
                <span
                  className={
                    Math.abs(
                      Number.parseFloat(totalAmount || 0) - payersTotal
                    ) > 0.01
                      ? "font-medium text-red-600"
                      : "font-medium"
                  }
                >
                  ${payersTotal.toFixed(2)}
                  {totalAmount &&
                    ` / $${Number.parseFloat(totalAmount).toFixed(2)}`}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="mt-4 w-full">
              {loading ? (
                <Loading action="Creating" item="expense" />
              ) : (
                "Create Expense"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
