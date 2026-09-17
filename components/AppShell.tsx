'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'

export default function AppShell({ children }: {children: React.ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div>
            <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginLeft: isExpanded ? '150px' : '56px',
                height: '100vh',
                transition: 'margin-left 0.2s ease-in-out'
            }}>
                {children}
            </div>
        </div>
    )
}