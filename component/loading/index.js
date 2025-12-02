import { createApp, reactive } from 'vue'

import Loading from './loading.vue'

const msg = reactive({
    show: false,
    title: '' //'拼命加载中...'
})

const $loading = createApp(Loading, { msg }).mount(document.createElement('div'))
// console.log($loading);
const load = {
    show(title = msg.title) {
        // 控制显示loading的方法
        msg.show = true
        msg.title = title
        document.body.appendChild($loading.$el)
    },

    hide() {
        // 控制loading隐藏的方法
        msg.show = false
    }
}

const loading = {
    install(app) {
        app.config.globalProperties.$loading = load
    }
}

export { loading, load }
