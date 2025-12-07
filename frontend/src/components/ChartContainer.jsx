import React from 'react'

export default function ChartContainer({ title, description, children }) {
    return (
        <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
            <div className="mt-6">
                {children}
            </div>
        </div>
    )
}
