export function toSlashDate(dateString: string): string {
    if (!dateString) return dateString
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
}
