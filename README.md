
# common-utils
一个轻量的实用工具集合

## 文件说明
- `README.md`：项目说明（本文件）
- `LICENSE`：许可证

## 现有工具类一览

仓库目前包含以下实用工具（按目录）：

- `export-excel/exportXlsx.js` — XLSX 导出
	- 功能：支持单 Sheet 与多 Sheet 导出，固定表头顺序，支持嵌套字段与自定义格式化函数，支持列宽设置。
	- 适用场景：需要把后端或前端表格数据导出为 Excel 文件的场景（浏览器端下载或 Node 写入）。
      - 支持单 Sheet 与多 Sheet 导出
      - 固定表头顺序（按 `headers` 指定），避免字段顺序错乱
      - 支持嵌套字段访问（如 `user.name`）和自定义格式化函数
      - 可设置列宽，兼容常见浏览器和 Node 环境的文件导出
	- 简要使用：

		```powershell
		yarn install xlsx
		```
		
		```javascript
		import { exportSingleSheetXlsx, exportMultiSheetXlsx } from './export-excel/exportXlsx.js';

		// 单表示例
		exportSingleSheetXlsx({
			headers: ['姓名', '年龄', '邮箱'],
			data: [
				{ name: '张三', age: 25, contact: { email: 'zhangsan@example.com' } },
				{ name: '李四', age: 30, contact: { email: 'lisi@example.com' } }
			],
			sheetName: '用户列表',
			fileName: '用户信息表',
			colWidths: [15, 8, 30],
			formatFn: (item, header) => {
				switch (header) {
					case '姓名': return item.name;
					case '年龄': return `${item.age}岁`;
					case '邮箱': return item.contact?.email || '';
					default: return '';
				}
			}
		});
		```

		```javascript
		// 多表示例
		const sheet1 = {
			sheetName: '用户表',
			headers: ['姓名', '年龄'],
			data: [
				{ name: '张三', age: 25 }
			],
			colWidths: [15, 8]
		};

		const sheet2 = {
			sheetName: '订单表',
			headers: ['订单号', '金额'],
			data: [
				{ orderNo: 'OD001', amount: 100 }
			],
			formatFn: (item, header) => {
				if (header === '金额') return `${item.amount}元`;
				return item[header.toLowerCase()];
			}
		};

		exportMultiSheetXlsx({
			sheets: [sheet1, sheet2],
			fileName: '用户订单汇总'
		});
		```

		- `exportMultiSheetXlsx({ sheets, fileName })`
  		  - `sheets`: Array<SheetConfig>
	      - `sheetName` (string) 必填
	      - `headers` (string[]) 必填，决定列顺序
	      - `data` (Object[]) 必填
	      - `colWidths` (number[]) 可选，与 `headers` 对应
	      - `formatFn` (item, header, rowIndex) 可选，返回单元格显示值
		  - `fileName` (string) 可选（不含后缀）
		- 返回 `true` | `false` 表示导出是否成功
		- `exportSingleSheetXlsx(config)`：简化调用（内部调用 `exportMultiSheetXlsx`）



- `water/water-type.js` — 水质等级与颜色映射（Vue 组合式写法）
	- 功能：导出水质等级数组 `typeList` 与基于等级返回颜色的计算属性 `waterColor`。
	- 适用场景：在水质相关展示页面中根据等级渲染不同颜色或标签。
	- 简要使用（在 Vue 组件中）：
		```javascript
		import { waterTypeList, waterColor } from '@/water/water-type.js'
		// 在模板中： :style="{ background: waterColor(3) }"
		```

- `date-utils/index.js` — 日期工具函数库
	- 功能：提供日期格式化、范围计算（今日、昨日、本周、本月、近7天）、日期差计算、日期列表生成、日期验证等便捷方法。
	- 适用场景：需要处理日期范围选择、日期格式化、日期计算等前端常见场景。
	- 简要使用：
		```javascript
		import { formatDate, getTodayRange, getThisWeekRange, getLast7DaysRange, getDateRange, getDaysDiff } from './date-utils/index.js'
		
		// 格式化日期
		const dateStr = formatDate(new Date()) // '2025-12-02'
		
		// 获取日期范围
		const today = getTodayRange() // { startTime: '2025-12-02', endTime: '2025-12-02' }
		const thisWeek = getThisWeekRange() // { startTime: '2025-11-24', endTime: '2025-11-30' }
		const last7Days = getLast7DaysRange() // { startTime: '2025-11-25', endTime: '2025-12-02' }
		
		// 获取日期列表
		const dates = getDateRange('2025-12-01', '2025-12-03') // ['2025-12-01', '2025-12-02', '2025-12-03']
		
		// 计算日期差
		const days = getDaysDiff('2025-12-01', '2025-12-03') // 2
		
		// 快速预设选择
		import { getDateByPreset } from './date-utils/index.js'
		const range = getDateByPreset('thisMonth') // 获取本月范围
		const range2 = getDateByPreset('last7Days') // 获取近7天范围
		```
	- 导出方法：
		- `formatDate(date)` - 格式化为 YYYY-MM-DD
		- `getTodayRange()` - 今日范围
		- `getYesterdayRange()` - 昨日范围
		- `getThisWeekRange()` - 本周范围（周一到周日）
		- `getThisMonthRange()` - 本月范围
		- `getLast7DaysRange()` - 近7天范围（含今日）
		- `getDateRange(startDate, endDate)` - 范围内日期列表
		- `getDateByPreset(preset)` - 快速预设选择（'today'、'yesterday'、'thisWeek'、'thisMonth'、'last7Days'）
		- `getDaysDiff(date1, date2)` - 日期差计算
		- `isValidDateFormat(dateStr)` - 日期格式验证

- `mqtt/index.js` — MQTT 客户端封装
	- 功能：基于 `mqtt`（npm 包）封装的轻量客户端类 `MQTTClient`，支持连接、订阅、接收消息、发送和断开连接。
	- 适用场景：需要通过 WebSocket 或 TCP 与 MQTT Broker 通信时使用（例如实时数据推送、设备消息接收）。
	- 简要使用：
		```powershell
		yarn add mqtt
		```

		```javascript
		// 引入
		import MQTTClient from './mqtt/index.js'
		// 创建实例
		const client = new MQTTClient('wss://broker.emqx.io:8084/mqtt', 'test/topic', { username: 'user', password: 'pass' })
		// 连接
		client.connect()
		// 接收消息
		client.onMessage((topic, msg) => console.log(topic, msg))
		// 发送消息
		client.publish('test/topic', 'hello')
		// 断开
		client.disconnect()
		```

- `loading/index.js` — 全局loading效果
	- 功能：提供全局 Loading 组件与插件，支持动态显示/隐藏加载动画（支持自定义加载提示文字），内置 CSS 动画效果。
	- 适用场景：需要在页面加载、数据请求或长时任务时显示全局加载指示器，提升用户体验。
	- 简要使用：
		```powershell
		yarn add loaders.css
		```

		```javascript
		// main.js - 注册为全局插件
		import { loading } from './component/loading/index.js'
		app.use(loading)
		```

		```javascript
		// 组件内使用
		export default {
			methods: {
				async fetchData() {
					this.$loading.show('正在加载数据...')
					try {
						// 执行异步操作
						await someAsyncTask()
					} finally {
						this.$loading.hide()
					}
				}
			}
		}
		```

		或直接导入 `load` 对象：

		```javascript
		import { load } from './component/loading/index.js'
		load.show('拼命加载中...')
		load.hide()
		```

- `vue-compose-element/index.js` — 在运行时返回 Vue 组件 DOM
	- 功能：动态创建一个 Vue 应用并挂载传入组件，返回组件的 DOM 元素（`$el`）。内部会使用项目路由实例。
	- 适用场景：需要把 Vue 单文件组件渲染成原生 DOM（例如在非 Vue 插件/第三方组件中嵌入 Vue 组件）。
	- 简要使用：
		```javascript
		import MyComponent from '@/components/MyComponent.vue'
		import { returnVueComponentElement } from 'vue-compose-element'
		const el = returnVueComponentElement(MyComponent, { propA: 1 })
		document.body.appendChild(el)
		```

- `svg-icon` — SVG 图标管理
	- 功能：管理与注册项目中的 SVG 图标，支持按需注册与在模板中通过图标名引用（例如 `<svg-icon name="home" />`）。
	- 适用场景：前端需要统一管理大量 SVG 图标、按需加载或将 SVG 转为 Vue 组件时使用。
	- 简要使用（示例）：

		```powershell
		yarn add vite-plugin-svg-icons
		```

		```javascript
		// vite-config.js 配置插件
		createSvgIconsPlugin({
			// 指定需要缓存的svg图标文件夹，即需要识别的svg都应该放在这个文件夹下  src/assets/svg可以更换为你项目中的svg存放路径
			iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
			// 或
			// iconDirs: [pathResolve('./src/assets')],
			// 指定symbolId格式（这里的配置与6.2步骤中的引入svg组件的name配置项写法有关）
			symbolId: 'icon-[dir]-[name]'
		})
		```

		```javascript
		// 引入组件
		import svgIcon from './svg-icon/index.js'
		// 模板中使用： 
		<svg-icon name="home" /> // home就是svg文件名称
		```

## 开发与贡献
- 欢迎提交 issue 或 PR：改进示例、添加 TypeScript 支持或增强兼容性。
- 如需我为项目添加 `package.json`、TypeScript 类型文件或演示脚本，请告知偏好，我会继续补充。

## 许可证
详见仓库根目录的 `LICENSE`。
