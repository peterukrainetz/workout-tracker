'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'

export default function AppShell({ children }: {children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div>
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div style={{ marginLeft: isCollapsed ? '0vw' : '10vw', transition: 'margin-left 0.2s' }}>
                {children}
            </div>
        </div>
    )
}