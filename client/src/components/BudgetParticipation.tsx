import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  Users, 
  School, 
  Car, 
  TreePine, 
  Shield,
  Building,
  Lightbulb,
  Save
} from "lucide-react";
import { PieChart as RechartsPieChart, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  currentAmount: number;
  proposedAmount: number;
  userAllocation: number;
  icon: React.ComponentType<any>;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

interface BudgetSubmission {
  categories: Record<string, number>;
  feedback: string;
  totalBudget: number;
}

const TOTAL_BUDGET = 50000000; // $50M total budget

const budgetCategories: BudgetCategory[] = [
  {
    id: 'education',
    name: 'Education',
    description: 'Schools, libraries, educational programs',
    currentAmount: 15000000,
    proposedAmount: 16000000,
    userAllocation: 16000000,
    icon: School,
    color: '#3B82F6',
    priority: 'high'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Roads, bridges, public transportation',
    currentAmount: 12000000,
    proposedAmount: 13000000,
    userAllocation: 13000000,
    icon: Car,
    color: '#10B981',
    priority: 'high'
  },
  {
    id: 'public_safety',
    name: 'Public Safety',
    description: 'Police, fire department, emergency services',
    currentAmount: 8000000,
    proposedAmount: 8500000,
    userAllocation: 8500000,
    icon: Shield,
    color: '#F59E0B',
    priority: 'high'
  },
  {
    id: 'parks',
    name: 'Parks & Recreation',
    description: 'Parks, recreation centers, community programs',
    currentAmount: 5000000,
    proposedAmount: 4500000,
    userAllocation: 4500000,
    icon: TreePine,
    color: '#22C55E',
    priority: 'medium'
  },
  {
    id: 'housing',
    name: 'Housing & Development',
    description: 'Affordable housing, urban development',
    currentAmount: 6000000,
    proposedAmount: 5000000,
    userAllocation: 5000000,
    icon: Building,
    color: '#8B5CF6',
    priority: 'medium'
  },
  {
    id: 'innovation',
    name: 'Innovation & Technology',
    description: 'Smart city initiatives, digital services',
    currentAmount: 4000000,
    proposedAmount: 3000000,
    userAllocation: 3000000,
    icon: Lightbulb,
    color: '#EF4444',
    priority: 'low'
  }
];

export function BudgetParticipation() {
  const [allocations, setAllocations] = useState<Record<string, number>>(
    budgetCategories.reduce((acc, cat) => ({
      ...acc,
      [cat.id]: cat.userAllocation
    }), {})
  );
  const [feedback, setFeedback] = useState("");

  const { data: submissions = [] } = useQuery({
    queryKey: ['/api/budget/submissions'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/budget/stats'],
  });

  const submitBudgetMutation = useMutation({
    mutationFn: async (submission: BudgetSubmission) => {
      const response = await fetch('/api/budget/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      if (!response.ok) throw new Error('Failed to submit budget');
      return response.json();
    },
    onSuccess: () => {
      // Show success message
      alert('Budget submission received! Thank you for your participation.');
    },
  });

  const totalAllocated = Object.values(allocations).reduce((sum, amount) => sum + amount, 0);
  const remainingBudget = TOTAL_BUDGET - totalAllocated;

  const handleAllocationChange = (categoryId: string, value: number[]) => {
    setAllocations(prev => ({
      ...prev,
      [categoryId]: value[0]
    }));
  };

  const handleSubmit = () => {
    const submission: BudgetSubmission = {
      categories: allocations,
      feedback,
      totalBudget: totalAllocated,
    };
    submitBudgetMutation.mutate(submission);
  };

  const chartData = budgetCategories.map(cat => ({
    name: cat.name,
    current: cat.currentAmount,
    proposed: cat.proposedAmount,
    user: allocations[cat.id],
    color: cat.color,
  }));

  const pieData = budgetCategories.map(cat => ({
    name: cat.name,
    value: allocations[cat.id],
    color: cat.color,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-civic-blue-900">Participatory Budget 2025</h2>
          <p className="text-gray-600 mt-1">Help decide how to allocate the $50M community budget</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-civic-green-600">
            ${totalAllocated.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Remaining: ${remainingBudget.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${TOTAL_BUDGET.toLocaleString()}</div>
            <Progress 
              value={(totalAllocated / TOTAL_BUDGET) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-gray-600 mt-1">
              {((totalAllocated / TOTAL_BUDGET) * 100).toFixed(1)}% allocated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSubmissions || 127}</div>
            <p className="text-sm text-gray-600">community members participated</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">+12% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-5 w-5" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="mb-2">
              Open for Input
            </Badge>
            <p className="text-sm text-gray-600">
              Deadline: March 15, 2025
            </p>
            <p className="text-xs text-gray-500 mt-1">
              28 days remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Allocation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allocate Your Budget</CardTitle>
              <p className="text-sm text-gray-600">
                Drag the sliders to distribute the $50M budget across categories
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {budgetCategories.map((category) => {
                const Icon = category.icon;
                const percentage = (allocations[category.id] / TOTAL_BUDGET) * 100;
                
                return (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: category.color }} />
                        </div>
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-xs text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${allocations[category.id].toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <Slider
                      value={[allocations[category.id]]}
                      onValueChange={(value) => handleAllocationChange(category.id, value)}
                      max={TOTAL_BUDGET}
                      step={100000}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Current: ${category.currentAmount.toLocaleString()}</span>
                      <span>Proposed: ${category.proposedAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Share your thoughts on budget priorities, concerns, or suggestions..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                  {feedback.length}/500 characters
                </p>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitBudgetMutation.isPending || remainingBudget !== 0}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Submit Budget
                </Button>
              </div>
              {remainingBudget !== 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Please allocate all ${TOTAL_BUDGET.toLocaleString()} before submitting
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Your Budget Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <RechartsPieChart
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Comparison</CardTitle>
              <p className="text-sm text-gray-600">
                Compare current, proposed, and your allocation
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                    fontSize={10}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="current" fill="#94A3B8" name="Current" />
                  <Bar dataKey="proposed" fill="#64748B" name="Proposed" />
                  <Bar dataKey="user" fill="#3B82F6" name="Your Allocation" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}