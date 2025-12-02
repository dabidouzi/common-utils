
# common-utils

一个轻量的实用工具集合，包含方便在前端/Node 环境中导出多 Sheet / 单 Sheet 的 XLSX 导出工具。

## 特性

- 支持单 Sheet 与多 Sheet 导出
- 保持表头顺序一致，支持嵌套字段（例如 `user.name`）
- 可自定义列宽与数据格式化函数
- 兼容浏览器下载与 Node 环境文件写入（基于 `xlsx` 库）

## 目录结构

- `export-excel/exportXlsx.js`：核心导出实现（ESM 模块，包含示例）
- `LICENSE`：许可证

## 安装

本仓库为工具集合示例，若在项目中使用，请先安装依赖：

```powershell
npm install xlsx
```

如果你的项目使用 CommonJS，请确保构建或将模块适配为 CommonJS。

## 用法（示例）

在支持 ESM 的环境中，你可以直接引入并调用导出方法：

```javascript
import { exportSingleSheetXlsx, exportMultiSheetXlsx } from './export-excel/exportXlsx.js';

// 单 Sheet 示例
const headers = ['姓名', '年龄', '邮箱'];
const data = [
	{ name: '张三', age: 25, contact: { email: 'zhangsan@example.com' } },
	{ name: '李四', age: 30, contact: { email: 'lisi@example.com' } }
];

exportSingleSheetXlsx({
	headers,
	data,
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

// 多 Sheet 示例
const sheet1 = { sheetName: '用户表', headers: ['姓名', '年龄'], data: [{ name: '张三', age: 25 }], colWidths: [15, 8] };
const sheet2 = { sheetName: '订单表', headers: ['订单号', '金额'], data: [{ orderNo: 'OD001', amount: 100 }], formatFn: (item, header) => header === '金额' ? `${item.amount}元` : item[header.toLowerCase()] };

exportMultiSheetXlsx({ sheets: [sheet1, sheet2], fileName: '用户订单汇总' });
```

## API 说明

- `exportMultiSheetXlsx({ sheets, fileName })`：导出多 Sheet 文件，参数说明：
	- `sheets`：数组，每项是 Sheet 配置对象，包含：
		- `sheetName` (string) - 必填，工作表名称
		- `headers` (string[]) - 必填，表头字段（顺序决定列顺序）
		- `data` (Object[]) - 必填，数据数组
		- `colWidths` (number[]) - 可选，列宽配置，与 `headers` 顺序对应
		- `formatFn` (Function) - 可选，`(item, header, rowIndex) => value`，用于格式化每个单元格的值
	- `fileName` (string) - 可选，导出文件名（不含后缀，默认自动生成）

- `exportSingleSheetXlsx(config)`：单 Sheet 简化调用，等价于调用 `exportMultiSheetXlsx` 并将 `config` 包装为单元素 `sheets`。

返回值：函数会返回 `true` 或 `false` 表示导出是否成功（函数内部会在控制台打印详细信息）。

## 开发 & 贡献

- 欢迎提交 issue 或 PR，对示例、兼容性和文档进行改进。
- 注意：当前文件为 ESM 模块，若在 CommonJS 项目中使用，请根据需要进行转换或通过打包工具（如 webpack/rollup）处理。

## 许可证

本仓库使用 `LICENSE` 中声明的许可证。

---

如果你需要我为 README 添加更详细的 API 文档、TypeScript 类型定义示例或演示项目（包含 package.json），告诉我你的偏好，我会继续完善。
