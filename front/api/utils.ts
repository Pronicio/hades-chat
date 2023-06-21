export function getDate(time: string) {
    if (!time) return
    const date = new Date(parseInt(time));

    const today = new Date()
    const isToday = date.getDate() == today.getDate()
        && date.getMonth() == today.getMonth()
        && date.getFullYear() == today.getFullYear();
    const isSameYear = today.getFullYear() == date.getFullYear()

    if (isToday) {
        return date.toLocaleString(window.navigator.language, {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (isSameYear) {
        return date.toLocaleString(window.navigator.language, {
            month: 'numeric',
            day: 'numeric'
        })
    }

    return date.toLocaleString(window.navigator.language, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    })
}
