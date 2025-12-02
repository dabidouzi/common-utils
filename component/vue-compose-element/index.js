import { createApp, h } from 'vue'
import router from '@/router/index.js'

/**
 * 返回vue组件dom
 * @param component	xxx.vue
 * @param props	自定义传递给组件的属性数据
 * @returns {any|VNode}
 */
export function returnVueComponentElement(component, props = {}) {
    let app = createApp({
        render() {
            return h(component, props)
        }
    })
    app.use(router)
    let mount = app.mount(document.createElement('div'))
    return mount.$el
}


/**
 * 使用方式
 * import MyComponent from '@/components/MyComponent.vue'
 * import { returnVueComponentElement } from 'vue-compose-element/index.js'
 *
 * returnVueComponentElement(MyComponent, { prop1: value1, prop2: value2 })
 */