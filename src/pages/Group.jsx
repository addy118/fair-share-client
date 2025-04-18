import React, { useState, useEffect, createContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, IndianRupee, Trash } from "lucide-react";
import Loading from "@/components/Loading";
import Settlements from "@/components/Settlements";
import GrpBalances from "@/components/GrpBalances";
import PaymentHistory from "@/components/PaymentHistory";
import useGroupData from "@/utils/useGroup";
import GrpSummary from "@/components/GrpSummary";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "@/axiosInstance";
import { useAuth } from "@/authProvider";

export const GroupContext = createContext({
  group: {},
  expenses: [],
  settlments: [],
  balances: [],
  history: [],
  setGroup: () => {},
  setBalances: () => {},
  setExpenses: () => {},
  setSettlements: () => {},
  setHistory: () => {},
  selectedItem: null,
  detailsOpen: false,
  setSelectedItem: () => {},
  setDetailsOpen: () => {},
});

export default function GroupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [history, setHistory] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("balances");

  const [newMembers, setNewMembers] = useState([]);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (newMembers.length === 0) {
      alert("Please add at least one member to the group.");
      return;
    }

    try {
      // console.log(newMembers); // [{ id, username }, {...}, ...]
      console.log("adding members to new group...");
      console.log(newMembers);
      for (const user of newMembers) {
        // console.log("adding user ", user.username);

        setIsLoading(true);
        await api.post(`/grp/${groupId}/member/new`, {
          username: user.username,
        });
        setIsLoading(false);

        // console.log("added user ", user.username);
      }

      console.log("members added successfully!");

      setNewGroupOpen(false);
      setNewMembers([]);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error("Failed to create a group: ", err);
    }
  };

  // create empty member field with empty username
  const addMemberField = () => {
    const newId = newMembers?.length
      ? Math.max(...newMembers.map((m) => m.id)) + 1
      : 1;
    setNewMembers([...newMembers, { id: newId, username: "" }]);
  };

  const removeMemberField = (id) => {
    setNewMembers((prev) => prev.filter((member) => member.id !== id));
  };

  // fill the empty username
  const updateMemberUsername = (id, value) => {
    setNewMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, username: value } : member
      )
    );
  };

  const handleLeaveGroup = async () => {
    try {
      console.log(`user ${user.id} leaving the group ${groupId}...`);

      setIsLoading(true);
      await api.delete(`/grp/${groupId}/member/${user.id}`);
      setIsLoading(false);

      console.log(`user ${user.id} left the group ${groupId}`);
      navigate("/groups");
    } catch (err) {
      console.error("Error leaving group: ", error);
      alert("Error leaving the group ", err);
    }
  };

  // fetch group related data from api
  const {
    group: grp,
    balances: bal,
    expenses: exp,
    settlements: stlment,
    history: hist,
    loading,
    error,
  } = useGroupData(Number(groupId));

  // update states on change of any data
  useEffect(() => {
    setGroup(grp);
    setBalances(bal);
    setExpenses(exp);
    setSettlements(stlment);
    setHistory(hist);
  }, [grp, bal, exp, hist, loading]);

  if (error) console.log(error);
  if (loading) return <Loading item="group" />;

  return (
    <GroupContext.Provider
      value={{
        settlements,
        setSettlements,
        balances,
        setBalances,
        group,
        setGroup,
        expenses,
        setExpenses,
        history,
        setHistory,
        selectedItem,
        setSelectedItem,
        detailsOpen,
        setDetailsOpen,
      }}
    >
      <div className="mx-auto max-w-4xl px-4">
        {group && (
          <>
            {/* group header */}
            <div className="mb-8 flex flex-col items-start justify-between md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">{group.name}</h1>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/groups/${groupId}/expense/new`)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>

                <Dialog open={newGroupOpen} onOpenChange={setNewGroupOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add new group members</DialogTitle>
                      <DialogDescription>
                        Enter username for new members you wish to add in this
                        group.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateGroup}>
                      <CardContent className="space-y-6">
                        {/* dynamic new member */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Group members</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addMemberField}
                            >
                              <Plus className="mr-1 h-4 w-4" /> Add Member
                            </Button>
                          </div>

                          {newMembers?.map((member, index) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-2"
                            >
                              <div className="flex-1">
                                <Label htmlFor={`member-${member.id}`}>
                                  Username
                                </Label>
                                <Input
                                  id={`member-${member.id}`}
                                  placeholder="Enter username"
                                  // value={member.username}
                                  onChange={(e) =>
                                    updateMemberUsername(
                                      member.id,
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMemberField(member.id)}
                                disabled={newMembers.length === 1}
                                className="mt-6"
                              >
                                <Trash className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Button type="submit" className="mt-4 w-full">
                          {isLoading ? (
                            <Loading action="Adding" item="member(s)" />
                          ) : (
                            "Add member(s)"
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="destructive" onClick={handleLeaveGroup}>
                  <Trash className="mr-2 h-4 w-4" />
                  {isLoading ? (
                    <Loading action="Leaving" item="group" />
                  ) : (
                    "Leave Group"
                  )}
                </Button>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="balances">Balances</TabsTrigger>
                <TabsTrigger value="settlements">Settle Debts</TabsTrigger>
                <TabsTrigger value="history">Payments History</TabsTrigger>
              </TabsList>

              {/* group balances tab */}
              <TabsContent value="balances" className="mt-6">
                <div className="mb-20 grid gap-6 md:grid-cols-2">
                  <GrpBalances />
                  <GrpSummary />
                </div>
              </TabsContent>

              {/* settle debts tab */}
              <TabsContent value="settlements" className="mt-6">
                <Settlements />
              </TabsContent>

              {/* payments history tab */}
              <TabsContent value="history" className="mt-6">
                <PaymentHistory />
                {/* <PaymentHistoryExport history={history} groupName={group?.name} /> */}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </GroupContext.Provider>
  );
}
