
# common-utils

一个轻量的实用工具集合，包含方便在前端/Node 环境中导出多 Sheet / 单 Sheet 的 XLSX 导出工具。
# common-utils

一个聚焦于 XLSX 导出的轻量工具集，适用于浏览器与 Node.js。当前仓库提供基于 `xlsx` 的单表/多表导出实现及示例。

## 亮点

- 支持单 Sheet 与多 Sheet 导出
- 固定表头顺序（按 `headers` 指定），避免字段顺序错乱
- 支持嵌套字段访问（如 `user.name`）和自定义格式化函数
- 可设置列宽，兼容常见浏览器和 Node 环境的文件导出

## 文件说明

- `export-excel/exportXlsx.js`：导出工具核心实现（ESM），内含单表/多表示例代码
- `README.md`：项目说明（本文件）
- `LICENSE`：许可证

## 现有工具类一览

仓库目前包含以下实用工具（按目录）：

- `export-excel/exportXlsx.js` — XLSX 导出
	- 功能：支持单 Sheet 与多 Sheet 导出，固定表头顺序，支持嵌套字段与自定义格式化函数，支持列宽设置。
	- 适用场景：需要把后端或前端表格数据导出为 Excel 文件的场景（浏览器端下载或 Node 写入）。
	- 简要使用：
		```javascript
		import { exportSingleSheetXlsx } from './export-excel/exportXlsx.js'
		exportSingleSheetXlsx({ headers: ['姓名','年龄'], data: [{ name: '张三', age: 25 }], fileName: '示例' })
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

- `water/water-type.js` — 水质等级与颜色映射（Vue 组合式写法）
	- 功能：导出水质等级数组 `typeList` 与基于等级返回颜色的计算属性 `waterColor`。
	- 适用场景：在水质相关展示页面中根据等级渲染不同颜色或标签。
	- 简要使用（在 Vue 组件中）：
		```javascript
		import { waterTypeList, waterColor } from '@/water/water-type.js'
		// 在模板中： :style="{ background: waterColor(3) }"
		```

- `mqtt/index.js` — MQTT 客户端封装
	- 功能：基于 `mqtt`（npm 包）封装的轻量客户端类 `MQTTClient`，支持连接、订阅、接收消息、发送和断开连接。
	- 适用场景：需要通过 WebSocket 或 TCP 与 MQTT Broker 通信时使用（例如实时数据推送、设备消息接收）。
	- 简要使用：
		```javascript
		import MQTTClient from './mqtt/index.js'
		const client = new MQTTClient('wss://broker.emqx.io:8084/mqtt', 'test/topic', { username: 'user', password: 'pass' })
		client.connect()
		client.onMessage((topic, msg) => console.log(topic, msg))
		client.publish('test/topic', 'hello')
		```

如果你希望我把每个工具改成更独立的包、补充 TypeScript 类型定义或为每个工具添加更详细示例（包含 demo 页面/脚本），告诉我你偏好，我可以继续实现。

## 快速开始

1. 安装依赖：

```powershell
npm install xlsx
```

2. 在 ESM 环境中引入并使用（示例）：

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

## API（简要）

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

## 说明与建议

- 当前实现为 ESM 模块；若在 CommonJS 项目中使用，请通过打包或改写为 CommonJS 导出。
- `formatFn` 推荐用于列名与对象字段不同或需格式化（日期、货币等）的场景。

## 开发与贡献

- 欢迎提交 issue 或 PR：改进示例、添加 TypeScript 支持或增强兼容性。
- 如需我为项目添加 `package.json`、TypeScript 类型文件或演示脚本，请告知偏好，我会继续补充。

## 许可证

详见仓库根目录的 `LICENSE`。
