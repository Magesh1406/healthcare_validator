// PASTE THIS IN frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  TrendingUp,
  FileText
} from 'lucide-react'
import StatCard from '../components/StatCard'
import ChartContainer from '../components/ChartContainer'
import RecentActivity from '../components/RecentActivity'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProviders: 0,
    validated: 0,
    needsReview: 0,
    processing: 0,
    accuracyRate: 0,
    avgProcessingTime: 0
  })

  // Fetch dashboard stats
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.get('/api/dashboard/stats'),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch recent activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => api.get('/api/dashboard/activity'),
    refetchInterval: 15000, // Refresh every 15 seconds
  })

  // Update stats when data loads
  useEffect(() => {
    if (dashboardData) {
      setStats(dashboardData.data)
    }
  }, [dashboardData])

  if (statsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time overview of provider validation system
          </p>
        </div>
        <button className="flex items-center gap-x-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          <Upload className="h-5 w-5" />
          Upload New Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Providers"
          value={stats.totalProviders.toLocaleString()}
          icon={<Users className="h-6 w-6 text-blue-500" />}
          change="+12.5%"
          changeType="positive"
          description="Total providers in system"
        />
        <StatCard
          title="Validated"
          value={stats.validated.toLocaleString()}
          icon={<CheckCircle className="h-6 w-6 text-emerald-500" />}
          change="+8.2%"
          changeType="positive"
          description="Successfully validated"
        />
        <StatCard
          title="Needs Review"
          value={stats.needsReview.toLocaleString()}
          icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
          change="+3.1%"
          changeType="negative"
          description="Requires manual review"
        />
        <StatCard
          title="Processing"
          value={stats.processing.toLocaleString()}
          icon={<Clock className="h-6 w-6 text-blue-500" />}
          change="+15.3%"
          changeType="neutral"
          description="Currently being processed"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${stats.accuracyRate}%`}
          icon={<TrendingUp className="h-6 w-6 text-emerald-500" />}
          change="+2.4%"
          changeType="positive"
          description="Validation accuracy"
        />
        <StatCard
          title="Avg Processing Time"
          value={`${stats.avgProcessingTime}s`}
          icon={<FileText className="h-6 w-6 text-purple-500" />}
          change="-12.7%"
          changeType="positive"
          description="Average validation time"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Validation Status Chart */}
        <ChartContainer
          title="Validation Status Distribution"
          description="Breakdown of provider validation status"
        >
          <div className="h-80">
            {/* Chart will be rendered here */}
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700">
                  Validation Status Chart
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Chart visualization will appear here
                </div>
              </div>
            </div>
          </div>
        </ChartContainer>

        {/* Recent Activity */}
        <RecentActivity
          activities={activityData?.data || []}
          loading={activityLoading}
        />
      </div>

      {/* System Performance */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-medium text-gray-900">System Performance</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-sm font-medium text-blue-800">Uptime</div>
            <div className="mt-1 text-2xl font-semibold text-blue-900">99.95%</div>
            <div className="mt-2 text-sm text-blue-700">Last 30 days</div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-4">
            <div className="text-sm font-medium text-emerald-800">API Response Time</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-900">142ms</div>
            <div className="mt-2 text-sm text-emerald-700">Average latency</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="text-sm font-medium text-purple-800">Cost Savings</div>
            <div className="mt-1 text-2xl font-semibold text-purple-900">76%</div>
            <div className="mt-2 text-sm text-purple-700">vs manual process</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard