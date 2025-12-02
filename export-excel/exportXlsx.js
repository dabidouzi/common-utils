import * as XLSX from "xlsx";

/**
 * 导出多 Sheet XLSX 文件（无依赖冲突版）
 * @param {Object[]} sheets - 多 Sheet 配置数组
 * @param {string} sheets[].sheetName - Sheet 名称（必填）
 * @param {string[]} sheets[].headers - 列标头（必填，与数据字段对应）
 * @param {Object[]} sheets[].data - 导出数据（必填，数组对象）
 * @param {number[]} [sheets[].colWidths] - 列宽配置（可选，与标头顺序一致）
 * @param {Function} [sheets[].formatFn] - 数据格式化函数（可选，处理每条数据）
 * @param {string} fileName - 导出文件名（无需后缀，自动补 .xlsx）
 * @returns {boolean} 导出成功/失败
 */
export const exportMultiSheetXlsx = async ({ sheets, fileName }) => {
  try {
    // 1. 基础参数校验（避免无效调用）
    if (!Array.isArray(sheets) || sheets.length === 0) {
      console.error("导出失败：请传入至少一个 Sheet 配置");
      return false;
    }
    if (!fileName || typeof fileName !== "string") {
      fileName = `导出报表_${new Date().getTime()}`;
    }

    // 2. 创建 Excel 工作簿
    const workbook = XLSX.utils.book_new();

    // 3. 批量处理每个 Sheet
    for (const [index, sheetConfig] of sheets.entries()) {
      const { sheetName, headers, data, colWidths, formatFn } = sheetConfig;

      // 单个 Sheet 必填参数校验
      if (!sheetName) {
        console.error(`导出失败：第 ${index + 1} 个 Sheet 缺少 sheetName`);
        continue; // 跳过当前 Sheet，不影响其他 Sheet 导出
      }
      if (!Array.isArray(headers) || headers.length === 0) {
        console.error(`导出失败：Sheet [${sheetName}] 缺少 headers`);
        continue;
      }
      if (!Array.isArray(data) || data.length === 0) {
        console.error(`导出失败：Sheet [${sheetName}] 缺少有效数据`);
        continue;
      }

      // 4. 数据格式化（字段映射、值转换）
      const formattedData = data.map((item, rowIndex) => {
        const row = {};
        headers.forEach((header) => {
          try {
            // 支持格式化函数、嵌套字段（如 'user.name'）、普通字段
            row[header] = formatFn
              ? formatFn(item, header, rowIndex)
              : getNestedValue(item, header);
          } catch (err) {
            row[header] = ""; // 字段解析失败时默认空值，避免影响整行
          }
        });
        return row;
      });

      // 5. 构建 Sheet（强制表头顺序与 headers 一致）
      const worksheet = XLSX.utils.json_to_sheet(formattedData, {
        header: headers, // 固定表头顺序，避免 JSON 字段顺序错乱
        skipHeader: false, // 不跳过表头（默认生成 headers 对应的表头）
      });

      // 6. 配置列宽（若传入 colWidths，长度需与 headers 一致）
      if (Array.isArray(colWidths) && colWidths.length === headers.length) {
        worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));
      } else if (colWidths) {
        console.warn(`Sheet [${sheetName}] 列宽配置长度与表头不一致，已忽略`);
      }

      // 7. 添加 Sheet 到工作簿（避免重复 Sheet 名称）
      const finalSheetName = checkDuplicateSheetName(
        workbook,
        sheetName,
        index
      );
      XLSX.utils.book_append_sheet(workbook, worksheet, finalSheetName);
    }

    // 8. 导出文件（兼容浏览器下载）
    XLSX.writeFile(workbook, `${fileName}.xlsx`, {
      bookType: "xlsx",
      type: "buffer",
      cellStyles: true, // 启用基础单元格样式支持
    });

    console.log(`文件导出成功：${fileName}.xlsx`);
    return true;
  } catch (error) {
    console.error("XLSX 导出核心错误：", error);
    alert("导出失败，请刷新页面重试！");
    return false;
  }
};

/**
 * 单 Sheet 导出（简化版，基于多 Sheet 封装）
 */
export const exportSingleSheetXlsx = (config) => {
  const {
    headers,
    data,
    sheetName = "数据报表",
    colWidths,
    formatFn,
    fileName,
  } = config;
  return exportMultiSheetXlsx({
    sheets: [{ sheetName, headers, data, colWidths, formatFn }],
    fileName,
  });
};

/**
 * 辅助函数：获取嵌套对象的值（支持 'a.b.c' 格式）
 */
const getNestedValue = (obj, key) => {
  if (!obj || typeof obj !== "object" || !key) return "";
  return key.split(".").reduce((acc, curr) => {
    return acc !== null && acc !== undefined ? acc[curr] : "";
  }, obj);
};

/**
 * 辅助函数：检查并处理重复的 Sheet 名称
 */
const checkDuplicateSheetName = (workbook, sheetName, index) => {
  const existingNames = workbook.SheetNames;
  if (!existingNames.includes(sheetName)) return sheetName;
  // 重复时添加序号（如 '员工列表_1'）
  return `${sheetName}_${index + 1}`;
};


// ==========================================================
// ================== 【单 Sheet 导出示例】 ==================
// ==========================================================
// 示例数据
const headers = ['姓名', '年龄', '邮箱'];
const data = [
  { name: '张三', age: 25, contact: { email: 'zhangsan@example.com' } },
  { name: '李四', age: 30, contact: { email: 'lisi@example.com' } }
];

// 导出配置
const config = {
  headers: headers,         // 列标题
  data: data,               // 数据数组
  sheetName: '用户列表',    // 工作表名称（可选，默认"数据报表"）
  fileName: '用户信息表',   // 文件名（无需后缀）
  colWidths: [15, 8, 30],   // 列宽配置（可选）
  formatFn: (item, header) => {  // 数据格式化函数（可选）
    switch(header) {
      case '姓名': return item.name;
      case '年龄': return item.age + '岁';
      case '邮箱': return getNestedValue(item, 'contact.email');
      default: return '';
    }
  }
};

// 执行导出
exportSingleSheetXlsx(config);

// ==========================================================
// ================== 【多 Sheet 导出示例】 ==================
// ==========================================================
第一个Sheet配置
const sheet1 = {
  sheetName: '用户表',
  headers: ['姓名', '年龄'],
  data: [
    { name: '张三', age: 25 },
    { name: '李四', age: 30 }
  ],
  colWidths: [15, 8]
};

// 第二个Sheet配置
const sheet2 = {
  sheetName: '订单表',
  headers: ['订单号', '金额'],
  data: [
    { orderNo: 'OD001', amount: 100 },
    { orderNo: 'OD002', amount: 200 }
  ],
  formatFn: (item, header) => {
    if (header === '金额') return item.amount + '元';
    return item[header.toLowerCase()];
  }
};

// 执行多Sheet导出
exportMultiSheetXlsx({
  sheets: [sheet1, sheet2],  // Sheet配置数组
  fileName: '用户订单汇总'    // 文件名
});