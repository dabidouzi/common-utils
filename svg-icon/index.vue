<template>
    <svg aria-hidden="true" class="svg-icon">
        <use :xlink:href="symbolId" />
    </svg>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
    name: 'SvgIcon',
    props: {
        // 使用的svg图标名称，也就是svg文件名
        name: {
            type: String,
            required: true
        },
        prefix: {
            type: String,
            default: 'icon'
        }
    },
    setup(props) {
        const symbolId = computed(() => `#${props.prefix}-${props.name}`)
        return { symbolId }
    }
})
</script>
<style scope>
.svg-icon {
    width: 26px;
    height: 26px;
}
</style>
