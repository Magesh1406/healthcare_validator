import React from 'react'

export default function RecentActivity({ activities, loading }) {
    if (loading) return <div>Loading activity...</div>

    return (
        <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="mt-6 flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                    {activities.length === 0 ? (
                        <li className="py-5 text-sm text-gray-500">No recent activity</li>
                    ) : (
                        activities.map((activity, idx) => (
                            <li key={idx} className="py-5">
                                {/* Simplified activity item */}
                                <div className="text-sm font-medium text-gray-900">{activity.description || 'Activity'}</div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}
