import React from 'react'

export default function LoadingSpinner({ fullScreen }) {
    if (fullScreen) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center p-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        </div>
    )
}
