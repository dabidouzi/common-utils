import path from 'path'
import { defineConfig } from 'vite'

// 引入svg插件
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default () =>
    defineConfig({
        plugins: [
            createSvgIconsPlugin({
                // 指定需要缓存的svg图标文件夹，即需要识别的svg都应该放在这个文件夹下  src/assets/svg可以更换为你项目中的svg存放路径
                iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
                // 或
                // iconDirs: [pathResolve('./src/assets')],
                // 指定symbolId格式（这里的配置与6.2步骤中的引入svg组件的name配置项写法有关）
                symbolId: 'icon-[dir]-[name]'
            })
        ]
    })
