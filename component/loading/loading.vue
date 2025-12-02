<template>
    <div v-show="msg.show" class="loading">
        <div class="loader">
            <div class="ball-spin-fade-loader">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div class="loading-text">{{ msg.title }}</div>
    </div>
</template>

<script setup>
import 'loaders.css'
defineProps({
    msg: {
        type: Object
    }
})
</script>

<style lang="less" scoped>
@import url('./style.less');
</style>
