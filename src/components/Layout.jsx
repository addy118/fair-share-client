import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Users, PlusCircle, Trash, Plus, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/axiosInstance";
import { CardContent, CardFooter } from "./ui/card";
import Loading from "./Loading";
import Logo from "./Logo";
import {
  SignedIn,
  SignedOut,
  SignOutButton,
  useUser,
} from "@clerk/clerk-react";
import formatUser from "@/utils/formatUser";
import { toast } from "sonner";

export default function Layout() {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const user = formatUser(clerkUser);
  const [newGroupName, setNewGroupName] = useState("");
  const [newMembers, setNewMembers] = useState([""]);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setNewGroupName("");
    setNewMembers([""]);
  }, [newGroupOpen]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!newGroupName.trim()) {
      toast.error("Group name cannot be empty.");
      return;
    }

    if (newMembers.length === 0) {
      toast.error("Please add at least one member to the group.");
      return;
    }

    // add the current member (group creator) to the group
    const updatedUsers = [
      ...newMembers,
      { id: user.id, username: user.username },
    ];

    try {
      setLoading(true);
      const groupRes = await api.post(`/grp/new`, { name: newGroupName });

      for (const user of updatedUsers) {
        await api.post(`/grp/${groupRes.data.group.id}/member/new`, {
          username: user.username,
        });
      }

      setNewGroupOpen(false);
      setNewGroupName("");
      setNewMembers([]);
      navigate("/groups");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const addMemberField = () => {
    const newId = newMembers?.length
      ? Math.max(...newMembers.map((m) => m.id)) + 1
      : 1;
    setNewMembers([...newMembers, { id: newId, username: "" }]);
  };

  const removeMemberField = (id) => {
    setNewMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const updateMemberUsername = (id, value) => {
    setNewMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, username: value } : member
      )
    );
  };

  const currentYear = new Date().getFullYear();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 font-sans text-white">
      <div className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/90 shadow-lg backdrop-blur-md">
        <header className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:h-20">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-2 text-white md:flex lg:space-x-4">
            <SignedIn>
              <Button
                onClick={() => navigate("groups")}
                variant="ghost"
                className="text-sm lg:text-base"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">My Groups</span>
                <span className="sm:hidden">Groups</span>
              </Button>

              <Dialog open={newGroupOpen} onOpenChange={setNewGroupOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-sm lg:text-base">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Create Group</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="glass-dark mx-4 max-w-md border border-gray-700 sm:max-w-lg">
                  <DialogHeader className="text-teal-400">
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>
                      Enter a name for your new expense sharing group.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateGroup}>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="group-name" className="mb-3 text-white">
                          Group Name
                        </Label>

                        <Input
                          id="group-name"
                          placeholder="Roommates, Goa Trip, etc."
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          required
                          className="border-gray-700 bg-[#0f1522]/50"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <Label className="text-white">Group members</Label>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addMemberField}
                            className="border-gray-700 hover:bg-gray-700/70 hover:text-teal-400"
                          >
                            <Plus className="mr-1 h-4 w-4" /> Add Member
                          </Button>
                        </div>

                        {newMembers?.map((member) => (
                          <div
                            key={member.id}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center"
                          >
                            <div className="flex-1">
                              <Label
                                htmlFor={`member-${member.id}`}
                                className="mb-3 text-white"
                              >
                                Username
                              </Label>

                              <Input
                                id={`member-${member.id}`}
                                placeholder="Enter the correct username"
                                onChange={(e) =>
                                  updateMemberUsername(
                                    member.id,

                                    e.target.value
                                  )
                                }
                                required
                                className="border-gray-700 bg-gray-800/50"
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMemberField(member.id)}
                              disabled={newMembers.length === 1}
                              className="mt-6 hover:text-red-400 sm:mt-6"
                            >
                              <Trash className="h-4 w-4 text-red-500/90" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        type="submit"
                        className="mt-4 w-full border-none bg-gradient-to-r from-teal-500 to-teal-400 text-white hover:from-teal-400 hover:to-teal-500"
                      >
                        {loading ? (
                          <Loading action="Creating" item="group" />
                        ) : (
                          "Create Group"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </SignedIn>

            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer">
                <Button
                  variant="ghost"
                  className="gap-1 text-white transition-colors hover:text-teal-400 lg:gap-2"
                >
                  <User className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="text-sm lg:text-base">Account</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="bottom"
                align="end"
                sideOffset={8}
                className="z-50 min-w-[180px] rounded-xl border border-gray-700/50 bg-gray-800/90 p-2 text-white shadow-xl backdrop-blur-md transition-all duration-200"
              >
                <SignedIn>
                  <DropdownMenuLabel className="px-2 py-1 text-sm text-gray-300">
                    My Account
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="my-1 bg-gray-700" />

                  <DropdownMenuItem
                    className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-sm transition-colors hover:bg-gray-700/50 hover:text-teal-400 focus:bg-gray-700/50 focus:text-teal-400 focus:outline-none"
                    asChild
                  >
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-red-300 transition-colors hover:bg-red-900/40 hover:text-red-400 focus:bg-red-900/40 focus:text-red-400 focus:outline-none">
                    <SignOutButton />
                  </DropdownMenuItem>
                </SignedIn>

                <SignedOut>
                  <DropdownMenuItem className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-sm transition-colors hover:bg-gray-700/50 hover:text-teal-400 focus:bg-gray-700/50 focus:text-teal-400 focus:outline-none">
                    <Link to="/login">Sign In</Link>
                  </DropdownMenuItem>
                </SignedOut>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white"
            >
              {!mobileMenuOpen && <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-4 md:hidden">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                className="text-white hover:text-teal-400"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex h-full flex-col px-4 pt-20">
              <div className="space-y-1 rounded-md bg-[#151e32] px-1 py-4">
                <SignedIn>
                  <Button
                    onClick={() => {
                      navigate("groups");
                      closeMobileMenu();
                    }}
                    variant="ghost"
                    className="w-full justify-start text-left text-sm text-white hover:text-teal-400"
                  >
                    <Users className="h-3 w-3" />
                    My Groups
                  </Button>

                  <Button
                    onClick={() => {
                      setNewGroupOpen(true);
                      closeMobileMenu();
                    }}
                    variant="ghost"
                    className="mb-2 w-full justify-start text-left text-sm text-white hover:text-teal-400"
                  >
                    <PlusCircle className="h-3 w-3" />
                    Create Group
                  </Button>

                  <div className="border-t border-gray-700 bg-[#151e32] pt-2">
                    <Button
                      onClick={() => {
                        navigate("/profile");
                        closeMobileMenu();
                      }}
                      variant="ghost"
                      className="w-full justify-start text-left text-sm text-white hover:text-teal-400"
                    >
                      <User className="h-3 w-3" />
                      Profile
                    </Button>

                    <div className="">
                      <SignOutButton>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left text-sm text-red-300 hover:text-red-400"
                        >
                          Sign Out
                        </Button>
                      </SignOutButton>
                    </div>
                  </div>
                </SignedIn>

                <SignedOut>
                  <Button
                    onClick={() => {
                      navigate("/login");

                      closeMobileMenu();
                    }}
                    variant="ghost"
                    className="w-full justify-start text-left text-lg text-white hover:text-teal-400"
                  >
                    Sign In
                  </Button>
                </SignedOut>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 py-8 sm:py-12 lg:py-16">
        <Outlet />
      </div>

      <footer className="relative overflow-hidden border-t border-gray-800 bg-gray-900/80 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-6 md:py-8">
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center text-xs text-gray-500 sm:text-sm">
            <p>© {currentYear} Fairshare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
