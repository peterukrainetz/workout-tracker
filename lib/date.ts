export function toLocalDateString(d: Date): string { 
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`
}

export function formatDateForDisplay(dateString: string): string { 
      const date = dateString.split('T')[0]
      const parts = date.split('-')
      return `${parts[1].replace(/^0+/, "")}/${parts[2].replace(/^0+/, "")}/${parts[0]}`
}