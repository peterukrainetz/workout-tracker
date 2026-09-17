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
                marginLeft: '75px',
                height: '100vh'
            }}>
                {children}
            </div>
        </div>
    )
}