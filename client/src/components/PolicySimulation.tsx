import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  Building, 
  Leaf, 
  Users,
  DollarSign,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Play,
  RotateCcw
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";

interface PolicyVariable {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  minValue: number;
  maxValue: number;
  unit: string;
  category: 'budget' | 'tax' | 'regulation' | 'service';
}

interface SimulationResult {
  id: string;
  scenario: string;
  outcomes: {
    economic: number;
    social: number;
    environmental: number;
    approval: number;
  };
  impacts: Impact[];
  timeline: TimelinePoint[];
  risks: Risk[];
}

interface Impact {
  category: string;
  description: string;
  magnitude: number;
  timeframe: 'immediate' | 'short-term' | 'long-term';
  affected_groups: string[];
}

interface TimelinePoint {
  year: number;
  budget: number;
  jobs: number;
  population: number;
  satisfaction: number;
}

interface Risk {
  type: string;
  description: string;
  probability: number;
  severity: number;
  mitigation: string;
}

const policyVariables: PolicyVariable[] = [
  {
    id: 'property_tax',
    name: 'Property Tax Rate',
    description: 'Annual property tax rate percentage',
    currentValue: 1.2,
    minValue: 0.5,
    maxValue: 3.0,
    unit: '%',
    category: 'tax'
  },
  {
    id: 'education_budget',
    name: 'Education Budget',
    description: 'Annual education spending per student',
    currentValue: 12000,
    minValue: 8000,
    maxValue: 18000,
    unit: '$',
    category: 'budget'
  },
  {
    id: 'infrastructure_spending',
    name: 'Infrastructure Investment',
    description: 'Annual infrastructure maintenance and improvement budget',
    currentValue: 25000000,
    minValue: 15000000,
    maxValue: 40000000,
    unit: '$',
    category: 'budget'
  },
  {
    id: 'business_tax',
    name: 'Business Tax Rate',
    description: 'Commercial property and business tax rate',
    currentValue: 2.5,
    minValue: 1.0,
    maxValue: 5.0,
    unit: '%',
    category: 'tax'
  },
  {
    id: 'environmental_regulations',
    name: 'Environmental Regulations',
    description: 'Strictness of environmental compliance requirements',
    currentValue: 70,
    minValue: 30,
    maxValue: 100,
    unit: 'index',
    category: 'regulation'
  },
  {
    id: 'public_services',
    name: 'Public Services Level',
    description: 'Quality and availability of public services',
    currentValue: 75,
    minValue: 50,
    maxValue: 100,
    unit: 'index',
    category: 'service'
  }
];

export function PolicySimulation() {
  const [variables, setVariables] = useState<Record<string, number>>(
    policyVariables.reduce((acc, v) => ({ ...acc, [v.id]: v.currentValue }), {})
  );
  const [activeScenario, setActiveScenario] = useState<string>('current');
  const [isRunning, setIsRunning] = useState(false);

  const { data: simulationResult } = useQuery({
    queryKey: ['/api/policy/simulate', variables],
    enabled: activeScenario !== 'current',
  });

  const runSimulationMutation = useMutation({
    mutationFn: async (params: Record<string, number>) => {
      setIsRunning(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await fetch('/api/policy/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: params }),
      });
      return response.json();
    },
    onSettled: () => setIsRunning(false),
  });

  const result = simulationResult as SimulationResult;

  const handleVariableChange = (id: string, value: number[]) => {
    setVariables(prev => ({ ...prev, [id]: value[0] }));
  };

  const resetToDefaults = () => {
    setVariables(policyVariables.reduce((acc, v) => ({ ...acc, [v.id]: v.currentValue }), {}));
    setActiveScenario('current');
  };

  const runSimulation = () => {
    setActiveScenario('custom');
    runSimulationMutation.mutate(variables);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'budget': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'tax': return 'bg-green-50 text-green-700 border-green-200';
      case 'regulation': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'service': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getOutcomeColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-civic-blue-900">Policy Impact Simulator</h2>
          <p className="text-gray-600 mt-1">Model the effects of policy changes on your community</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={runSimulation} disabled={isRunning}>
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Simulation'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Policy Variables
            </CardTitle>
            <p className="text-sm text-gray-600">
              Adjust policy parameters to see their projected impact
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {policyVariables.map((variable) => {
              const currentValue = variables[variable.id];
              const change = ((currentValue - variable.currentValue) / variable.currentValue) * 100;
              
              return (
                <div key={variable.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{variable.name}</h4>
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(variable.category)}`}>
                          {variable.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{variable.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {variable.unit === '$' ? '$' : ''}{currentValue.toLocaleString()}{variable.unit === '%' ? '%' : variable.unit === '$' ? '' : ` ${variable.unit}`}
                      </div>
                      {change !== 0 && (
                        <div className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Slider
                    value={[currentValue]}
                    onValueChange={(value) => handleVariableChange(variable.id, value)}
                    min={variable.minValue}
                    max={variable.maxValue}
                    step={variable.unit === '%' ? 0.1 : variable.unit === '$' ? 1000 : 5}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {variable.unit === '$' ? '$' : ''}{variable.minValue.toLocaleString()}{variable.unit !== '$' ? variable.unit : ''}</span>
                    <span>Current: {variable.unit === '$' ? '$' : ''}{variable.currentValue.toLocaleString()}{variable.unit !== '$' ? variable.unit : ''}</span>
                    <span>Max: {variable.unit === '$' ? '$' : ''}{variable.maxValue.toLocaleString()}{variable.unit !== '$' ? variable.unit : ''}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Simulation Results */}
        <div className="space-y-6">
          {/* Outcome Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Projected Outcomes
                {isRunning && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-civic-blue-600"></div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getOutcomeColor(result.outcomes.economic)}`}>
                      {result.outcomes.economic}%
                    </div>
                    <div className="text-sm text-gray-600">Economic Impact</div>
                    <Progress value={result.outcomes.economic} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getOutcomeColor(result.outcomes.social)}`}>
                      {result.outcomes.social}%
                    </div>
                    <div className="text-sm text-gray-600">Social Wellbeing</div>
                    <Progress value={result.outcomes.social} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getOutcomeColor(result.outcomes.environmental)}`}>
                      {result.outcomes.environmental}%
                    </div>
                    <div className="text-sm text-gray-600">Environmental</div>
                    <Progress value={result.outcomes.environmental} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getOutcomeColor(result.outcomes.approval)}`}>
                      {result.outcomes.approval}%
                    </div>
                    <div className="text-sm text-gray-600">Public Approval</div>
                    <Progress value={result.outcomes.approval} className="mt-2 h-2" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Run a simulation to see projected outcomes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Projection */}
          {result?.timeline && (
            <Card>
              <CardHeader>
                <CardTitle>5-Year Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={result.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="satisfaction" 
                      stroke="#3B82F6" 
                      fill="#93C5FD" 
                      fillOpacity={0.3}
                      name="Community Satisfaction"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detailed Analysis */}
      {result && (
        <Tabs defaultValue="impacts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="impacts">Impact Analysis</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            <TabsTrigger value="timeline">Timeline Details</TabsTrigger>
          </TabsList>

          <TabsContent value="impacts">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.impacts?.map((impact, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{impact.category}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {impact.timeframe}
                          </Badge>
                          <div className={`text-sm font-medium ${
                            impact.magnitude > 70 ? 'text-green-600' : 
                            impact.magnitude > 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {impact.magnitude}% impact
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{impact.description}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Affects:</span>
                        {impact.affected_groups.map((group, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.risks?.map((risk, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          {risk.type}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {risk.probability}% likely
                          </Badge>
                          <Badge 
                            variant={risk.severity > 70 ? 'destructive' : risk.severity > 40 ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {risk.severity > 70 ? 'High' : risk.severity > 40 ? 'Medium' : 'Low'} severity
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Mitigation Strategy</span>
                        </div>
                        <p className="text-sm text-gray-700">{risk.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Year-by-Year Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.timeline?.map((point) => (
                    <div key={point.year} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Year {point.year}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            ${(point.budget / 1000000).toFixed(1)}M
                          </div>
                          <div className="text-xs text-gray-600">Budget</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {point.jobs.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Jobs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {point.population.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Population</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {point.satisfaction}%
                          </div>
                          <div className="text-xs text-gray-600">Satisfaction</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}