/**
 * 日期工具函数库
 * @description 提供日期格式化、范围计算（周、月、昨日等）的便捷方法
 * @author common-utils
 */

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date} date - 日期对象（默认为当前日期）
 * @returns {string} 格式化后的日期字符串
 * @example formatDate(new Date()) => '2025-12-02'
 */
export const formatDate = (date = new Date()) => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * 获取今日的日期范围
 * @returns {Object} { startTime, endTime } 格式为 YYYY-MM-DD
 * @example getTodayRange() => { startTime: '2025-12-02', endTime: '2025-12-02' }
 */
export const getTodayRange = () => {
    const now = new Date()
    const nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    const dateStr = formatDate(nowUTC)
    return {
        startTime: dateStr,
        endTime: dateStr
    }
}

/**
 * 获取昨日的日期范围
 * @returns {Object} { startTime, endTime } 格式为 YYYY-MM-DD
 * @example getYesterdayRange() => { startTime: '2025-12-01', endTime: '2025-12-01' }
 */
export const getYesterdayRange = () => {
    const now = new Date()
    const nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    const yesterdayUTC = new Date(nowUTC)
    yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1)
    const dateStr = formatDate(yesterdayUTC)
    return {
        startTime: dateStr,
        endTime: dateStr
    }
}

/**
 * 获取本周（周一到周日）的日期范围
 * @returns {Object} { startTime, endTime } 格式为 YYYY-MM-DD
 * @example getThisWeekRange() => { startTime: '2025-12-01', endTime: '2025-12-07' }
 */
export const getThisWeekRange = () => {
    const today = new Date()
    const todayDate = today.getDate()
    const todayDay = today.getDay() // 0=周日，1=周一...6=周六

    let weekStartDate
    if (todayDay === 0) {
        // 今天是周日：本周一是 今天 - 6天
        weekStartDate = todayDate - 6
    } else {
        // 今天是周一到周六：本周一是 今天 - (今天的星期数 - 1)
        weekStartDate = todayDate - (todayDay - 1)
    }

    const weekStart = new Date(today)
    weekStart.setDate(weekStartDate)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    return {
        startTime: formatDate(weekStart),
        endTime: formatDate(weekEnd)
    }
}

/** 
 * 获取本月的日期范围
 * @returns {Object} { startTime, endTime } 格式为 YYYY-MM-DD
 * @example getThisMonthRange() => { startTime: '2025-12-01', endTime: '2025-12-31' }
 */
export const getThisMonthRange = () => {
    const now = new Date()
    const monthStartUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
    const monthEndUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0)) // 当月最后一天
    return {
        startTime: formatDate(monthStartUTC),
        endTime: formatDate(monthEndUTC)
    }
}

/**
 * 获取近7天（含今日）的日期范围
 * @returns {Object} { startTime, endTime } 格式为 YYYY-MM-DD
 * @example getLast7DaysRange() => { startTime: '2025-11-25', endTime: '2025-12-02' }
 */
export const getLast7DaysRange = () => {
    const now = new Date()
    const endUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    const startUTC = new Date(endUTC)
    startUTC.setUTCDate(startUTC.getUTCDate() - 6) // 往前推 6 天（含今日共 7 天）
    return {
        startTime: formatDate(startUTC),
        endTime: formatDate(endUTC)
    }
}

/**
 * 获取指定日期范围内的所有日期列表
 * @param {string} startDate - 开始日期（格式 YYYY-MM-DD）
 * @param {string} endDate - 结束日期（格式 YYYY-MM-DD）
 * @returns {string[]} 日期字符串数组
 * @example getDateRange('2025-12-01', '2025-12-03') => ['2025-12-01', '2025-12-02', '2025-12-03']
 */
export const getDateRange = (startDate, endDate) => {
    const dates = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const current = new Date(start)

    while (current <= end) {
        dates.push(formatDate(current))
        current.setDate(current.getDate() + 1)
    }

    return dates
}

/**
 * 日期快速选择器：根据预设名称返回对应的日期范围
 * @param {string} preset - 预设名称：'today'、'yesterday'、'thisWeek'、'thisMonth'、'last7Days'
 * @returns {Object} { startTime, endTime } 格式为 YYYY-MM-DD；未知预设返回空对象
 * @example getDateByPreset('today') => { startTime: '2025-12-02', endTime: '2025-12-02' }
 */
export const getDateByPreset = (preset) => {
    const presetMap = {
        today: getTodayRange,
        yesterday: getYesterdayRange,
        thisWeek: getThisWeekRange,
        thisMonth: getThisMonthRange,
        last7Days: getLast7DaysRange
    }

    const fn = presetMap[preset]
    return fn ? fn() : {}
}

/**
 * 获取两个日期之间的天数差
 * @param {string|Date} date1 - 第一个日期
 * @param {string|Date} date2 - 第二个日期
 * @returns {number} 相差天数（date2 - date1）
 * @example getDaysDiff('2025-12-01', '2025-12-03') => 2
 */
export const getDaysDiff = (date1, date2) => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const timeDiff = d2 - d1
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24))
}

/**
 * 验证日期字符串格式是否为 YYYY-MM-DD
 * @param {string} dateStr - 日期字符串
 * @returns {boolean} 是否合法
 * @example isValidDateFormat('2025-12-02') => true
 */
export const isValidDateFormat = (dateStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateStr)) return false
    const date = new Date(dateStr)
    return date instanceof Date && !isNaN(date)
}

export default {
    formatDate,
    getTodayRange,
    getYesterdayRange,
    getThisWeekRange,
    getThisMonthRange,
    getLast7DaysRange,
    getDateRange,
    getDateByPreset,
    getDaysDiff,
    isValidDateFormat
}
