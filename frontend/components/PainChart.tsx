'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Session {
  id: number;
  patient_id: string;
  exercise_name: string;
  reps: number;
  pain_score: number;
  timestamp: string;
  synced: boolean;
  flagged: boolean;
}

interface PainChartProps {
  sessions: Session[];
}

export default function PainChart({ sessions }: PainChartProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Pain Trend</h3>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No session data available</p>
        </div>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = sessions
    .slice()
    .reverse() // Show oldest to newest
    .map((session, index) => {
      const date = new Date(session.timestamp);
      return {
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleString(),
        painScore: session.pain_score,
        reps: session.reps,
        exercise: session.exercise_name,
        sessionNumber: index + 1,
      };
    });

  // Calculate statistics
  const avgPainScore = sessions.reduce((sum, s) => sum + s.pain_score, 0) / sessions.length;
  const maxPainScore = Math.max(...sessions.map(s => s.pain_score));
  const minPainScore = Math.min(...sessions.map(s => s.pain_score));
  const highPainSessions = sessions.filter(s => s.pain_score >= 4).length;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-1">
            Session {data.sessionNumber}
          </p>
          <p className="text-xs text-gray-600 mb-2">{data.fullDate}</p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Pain Score:</span> {data.painScore}/5
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Reps:</span> {data.reps}
          </p>
          <p className="text-xs text-gray-500 mt-1">{data.exercise}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Pain Trend Analysis</h3>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-semibold mb-1">Average</p>
          <p className="text-2xl font-bold text-blue-700">{avgPainScore.toFixed(1)}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600 font-semibold mb-1">Lowest</p>
          <p className="text-2xl font-bold text-green-700">{minPainScore}</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-xs text-orange-600 font-semibold mb-1">Highest</p>
          <p className="text-2xl font-bold text-orange-700">{maxPainScore}</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-xs text-red-600 font-semibold mb-1">High Pain</p>
          <p className="text-2xl font-bold text-red-700">{highPainSessions}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line at pain score 4 (high pain threshold) */}
            <ReferenceLine
              y={4}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: 'High Pain', position: 'right', fill: '#ef4444', fontSize: 12 }}
            />
            
            {/* Pain score line */}
            <Line
              type="monotone"
              dataKey="painScore"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const isHighPain = payload.painScore >= 4;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={isHighPain ? '#ef4444' : '#3b82f6'}
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Normal Pain (1-3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">High Pain (4-5)</span>
        </div>
      </div>

      {/* Insights */}
      {highPainSessions > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">⚠️ Alert:</span> {highPainSessions} session(s) with high pain levels detected. 
            Consider adjusting exercise intensity or scheduling a follow-up.
          </p>
        </div>
      )}

      {sessions.length >= 3 && (
        <div className="mt-3">
          {sessions[0].pain_score < sessions[sessions.length - 1].pain_score ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-semibold">✓ Positive Trend:</span> Pain levels are decreasing over time. Keep up the good work!
              </p>
            </div>
          ) : sessions[0].pain_score > sessions[sessions.length - 1].pain_score ? (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <span className="font-semibold">⚠️ Attention Needed:</span> Pain levels are increasing. Consider reviewing the exercise plan.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
