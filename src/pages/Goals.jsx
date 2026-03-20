import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Target, Plus, DollarSign, Calendar,
  CheckCircle, Trash2, Edit
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CircularProgress = ({ current, target, size = 200, color = "#84CC16" }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-gray-900">{Math.round(percentage)}%</div>
        <div className="text-sm text-gray-600 mt-1">Complete</div>
      </div>
    </div>
  );
};

// ---- Local user + local "Goal" store (migration placeholder) ----
const getLocalUser = () => {
  try {
    const raw = localStorage.getItem("sprout_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const goalsKey = (email) => `sprout_goals_${email || "anonymous"}`;

const goalStore = {
  list(email) {
    try {
      const raw = localStorage.getItem(goalsKey(email));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  save(email, goals) {
    localStorage.setItem(goalsKey(email), JSON.stringify(goals));
  },
  create(email, data) {
    const goals = this.list(email);
    const newGoal = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      user_email: email,
      completed: false,
      created_at: new Date().toISOString(),
      ...data,
    };
    const next = [newGoal, ...goals];
    this.save(email, next);
    return newGoal;
  },
  update(email, id, patch) {
    const goals = this.list(email);
    const next = goals.map((g) => (g.id === id ? { ...g, ...patch } : g));
    this.save(email, next);
    return next.find((g) => g.id === id);
  },
  delete(email, id) {
    const goals = this.list(email).filter((g) => g.id !== id);
    this.save(email, goals);
    return true;
  }
};

export default function Goals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: "",
    current_amount: "0",
    target_date: "",
    category: "Other",
    color: "#84CC16",
  });

  useEffect(() => {
    const currentUser = getLocalUser();
    if (!currentUser) {
      navigate(createPageUrl("Login"));
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const { data: goals = [] } = useQuery({
    queryKey: ["goals", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return goalStore.list(user.email);
    },
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (!user?.email) throw new Error("Not signed in");
      return goalStore.create(user.email, { ...data, user_email: user.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.email] });
      setShowDialog(false);
      resetForm();
      toast.success("Goal created! 🎯");
    },
    onError: () => toast.error("Could not create goal."),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (!user?.email) throw new Error("Not signed in");
      return goalStore.update(user.email, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.email] });
      setShowDialog(false);
      resetForm();
      toast.success("Goal updated!");
    },
    onError: () => toast.error("Could not update goal."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!user?.email) throw new Error("Not signed in");
      return goalStore.delete(user.email, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.email] });
      toast.success("Goal deleted");
    },
    onError: () => toast.error("Could not delete goal."),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      target_amount: "",
      current_amount: "0",
      target_date: "",
      category: "Other",
      color: "#84CC16",
    });
    setEditingGoal(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount || "0"),
    };

    if (Number.isNaN(data.target_amount) || data.target_amount <= 0) {
      toast.error("Target amount must be a positive number.");
      return;
    }
    if (Number.isNaN(data.current_amount) || data.current_amount < 0) {
      toast.error("Current amount must be 0 or more.");
      return;
    }

    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      target_amount: String(goal.target_amount ?? ""),
      current_amount: String(goal.current_amount ?? "0"),
      target_date: goal.target_date || "",
      category: goal.category || "Other",
      color: goal.color || "#84CC16",
    });
    setShowDialog(true);
  };

  const handleAddProgress = async (goalId, amount) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newAmount = (goal.current_amount || 0) + amount;
    const completed = newAmount >= goal.target_amount;

    await updateMutation.mutateAsync({
      id: goalId,
      data: { current_amount: newAmount, completed }
    });
  };

  const totalSaved = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + (g.target_amount || 0), 0);
  const completedGoals = goals.filter((g) => g.completed).length;

  const categoryColors = {
    "Emergency Fund": "#EF4444",
    "House Down Payment": "#3B82F6",
    "Car": "#A855F7",
    "Vacation": "#EC4899",
    "Education": "#F59E0B",
    "Other": "#84CC16",
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Savings Goals 🎯
            </h1>
            <p className="text-gray-600">Track your financial targets</p>
          </div>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => { resetForm(); setShowDialog(true); }}
                className="bg-[#1B2B5E] hover:bg-[#141E43] text-white shadow-lg "
              >
                <Plus className="w-5 h-5 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Goal Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Save for College"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional details"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category: v, color: categoryColors[v] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(categoryColors).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Amount ($)</Label>
                    <Input
                      type="number"
                      value={formData.target_amount}
                      onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Amount ($)</Label>
                    <Input
                      type="number"
                      value={formData.current_amount}
                      onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-500 hover:bg-[#2D9B6F]">
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-400 to-cyan-500 text-white">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">${totalSaved.toLocaleString()}</p>
              <p className="text-sm opacity-90">Total Saved</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-[#1B2B5E] text-white">
            <CardContent className="p-6">
              <Target className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">${totalTarget.toLocaleString()}</p>
              <p className="text-sm opacity-90">Total Target</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-400 to-pink-500 text-white">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{completedGoals}</p>
              <p className="text-sm opacity-90">Goals Achieved</p>
            </CardContent>
          </Card>
        </div>

        {goals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const remaining = (goal.target_amount || 0) - (goal.current_amount || 0);

              return (
                <Card key={goal.id} className="border-none shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-1">{goal.title}</CardTitle>
                        {goal.description && (
                          <p className="text-sm text-gray-600">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)} className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(goal.id)}
                          className="h-8 w-8 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="flex justify-center">
                      <CircularProgress
                        current={goal.current_amount || 0}
                        target={goal.target_amount || 1}
                        size={180}
                        color={goal.color || "#84CC16"}
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: goal.color }}>
                        ${(goal.current_amount || 0).toLocaleString()} / ${(goal.target_amount || 0).toLocaleString()}
                      </p>
                      {remaining > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          ${remaining.toLocaleString()} remaining
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Category</span>
                        <span
                          className="px-3 py-1 rounded-full text-white font-medium"
                          style={{ backgroundColor: goal.color }}
                        >
                          {goal.category}
                        </span>
                      </div>
                      {goal.target_date && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Target Date</span>
                          <span className="font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(goal.target_date), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>

                    {!goal.completed && (
                      <div className="grid grid-cols-3 gap-2">
                        {[10, 50, 100].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddProgress(goal.id, amount)}
                            className="text-xs"
                          >
                            +${amount}
                          </Button>
                        ))}
                      </div>
                    )}

                    {goal.completed && (
                      <div className="p-3 rounded-lg bg-gradient-to-r bg-[#E6F5EF] border border-[#2D9B6F] text-center">
                        <CheckCircle className="w-6 h-6 text-[#2D9B6F] mx-auto mb-1" />
                        <p className="text-sm font-semibold text-[#2D9B6F]">Goal Achieved! 🎉</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Goals Yet</h3>
              <p className="text-gray-600 mb-6">Start setting financial goals to track your savings progress</p>
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-[#1B2B5E] hover:bg-[#141E43]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
