'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'

export default function AppShell({ children }: {children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div>
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
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