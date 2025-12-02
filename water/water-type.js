/**
 * 水质类别相关配置
 * @description 根据标准文件《地表水环境质量标准》（GB3838-2002）设定的颜色分类
 * @author 又菜又爱玩
 */


import { computed } from 'vue'

// 按照等级返回颜色
export const backColor = computed(() => {
    return value => {
        const v = typeList.find(item => item.value === value)?.color

        return v
    }
})

// 水质类别颜色划分
export const typeList = [
    {
        value: 1,
        label: 'Ⅰ类',
        color: '#2B83EE'
    },
    {
        value: 2,
        label: 'Ⅱ类',
        color: '#2B83EE'
    },
    {
        value: 3,
        label: 'Ⅲ类',
        color: '#34C759'
    },
    {
        value: 4,
        label: 'Ⅳ类',
        color: '#FFCC00'
    },
    {
        value: 5,
        label: 'Ⅴ类',
        color: '#FF9500'
    },
    {
        value: 6,
        label: '劣Ⅴ类',
        color: '#FF3B30'
    }
]
