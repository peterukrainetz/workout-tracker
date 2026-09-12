'use client'

type ModalProps = {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
    return (
        isOpen ? (
            <div onClick={onClose} style={{
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
                <div onClick={(e) => e.stopPropagation()} style={{
                    padding: '2rem',
                    backgroundColor: '#171717',
                    borderRadius: '20px'
                }}>
                    {children}
                </div>
            </div>
        ) : null
    )
}