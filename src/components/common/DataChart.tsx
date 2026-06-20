import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface DataChartProps {
  data: DataPoint[];
  type?: 'line' | 'area' | 'bar';
  color?: string;
  height?: number;
  title?: string;
}

export const DataChart: React.FC<DataChartProps> = ({
  data,
  type = 'area',
  color = '#00C48C',
  height = 180,
  title
}) => {
  return (
    <div className="w-full">
      {title && (
        <div className="text-xs text-neon-blue mb-2 font-mono">{title}</div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 179, 255, 0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 31, 56, 0.95)',
                border: '1px solid rgba(0, 179, 255, 0.3)',
                borderRadius: '4px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#00B3FF' }}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#colorGradient)" />
          </AreaChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 179, 255, 0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 31, 56, 0.95)',
                border: '1px solid rgba(0, 179, 255, 0.3)',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 179, 255, 0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 31, 56, 0.95)',
                border: '1px solid rgba(0, 179, 255, 0.3)',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
