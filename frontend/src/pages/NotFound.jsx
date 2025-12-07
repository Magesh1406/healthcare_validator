import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
    return (
        <div className="p-4 text-center">
            <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
            <Link to="/" className="text-primary-600 hover:underline">Go Home</Link>
        </div>
    )
}
