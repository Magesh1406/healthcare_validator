import React from 'react'

export default function StatCard({ title, value, icon, change, changeType, description }) {
    return (
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</dd>
            <div className="mt-2 flex items-center text-sm">
                {icon}
                <span className={`ml-2 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                </span>
                <span className="ml-2 text-gray-400">{description}</span>
            </div>
        </div>
    )
}
