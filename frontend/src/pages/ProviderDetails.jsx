import React from 'react'
import { useParams } from 'react-router-dom'

export default function ProviderDetails() {
    const { id } = useParams()
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Provider Details</h1>
            <p>Details for provider ID: {id}</p>
        </div>
    )
}
