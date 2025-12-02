import * as XLSX from "xlsx";

/**
 * 导出多 Sheet XLSX 文件（修复数字 0 多余小数点+核心功能稳定版）
 * 核心功能：字段聚合配置、数据类型映射、小数位自动适配（无多余小数点）、空行过滤
 * @param {Object[]} sheets - 多 Sheet 配置数组（必填）
 * @param {string} sheets[].sheetName - Sheet 名称（必填）
 * @param {Object[]} sheets[].columns[].key - 数据字段名（必填，支持嵌套如 'user.name'）
 * @param {string} sheets[].columns[].title - 表头显示名称（必填）
 * @param {number} [sheets[].columns[].width] - 列宽（可选，默认 12）
 * @param {Function} [sheets[].columns[].formatFn] - 列级格式化函数（可选）
 * @param {string} [sheets[].columns[].type] - 数据类型（可选，默认 string；支持 string/number/date）
 * @param {string} [sheets[].columns[].dateFormat] - 日期格式（type=date 生效，默认 'yyyy-mm-dd'）
 * @param {number} [sheets[].columns[].decimalPlaces] - 最大保留小数位数（type=number 生效，默认 2；0 表示整数）
 * @param {Object[]} sheets[].data - 导出数据（必填，数组对象）
 * @param {boolean} [sheets[].ignoreEmptyRows] - 是否忽略空行（可选，默认 true）
 * @param {string} [fileName] - 导出文件名（可选，默认「导出报表_时间戳」）
 * @returns {boolean} 导出成功/失败
 */
export const exportMultiSheetXlsx = async ({ sheets, fileName }) => {
  try {
    // 1. 基础参数校验
    if (!Array.isArray(sheets) || sheets.length === 0) {
      console.error("导出失败：请传入至少一个 Sheet 配置");
      return false;
    }
    const finalFileName =
      fileName && typeof fileName === "string"
        ? fileName
        : `导出报表_${new Date().getTime()}`;

    // 2. 创建 Excel 工作簿
    const workbook = XLSX.utils.book_new();

    // 3. 处理每个 Sheet
    for (const [sheetIndex, sheetConfig] of sheets.entries()) {
      const { sheetName, columns, data, ignoreEmptyRows = true } = sheetConfig;

      // 单个 Sheet 必填参数校验
      if (!sheetName) {
        console.error(`导出失败：第 ${sheetIndex + 1} 个 Sheet 缺少 sheetName`);
        continue;
      }
      if (!Array.isArray(columns) || columns.length === 0) {
        console.error(`导出失败：Sheet [${sheetName}] 缺少 columns 配置`);
        continue;
      }
      if (!Array.isArray(data) || data.length === 0) {
        console.error(`导出失败：Sheet [${sheetName}] 缺少有效数据`);
        continue;
      }

      // 4. 解析 columns 配置
      const headers = columns.map((col) => col.title);
      const colWidths = columns.map((col) => col.width || 12);

      // 5. 数据格式化+类型转换（核心修复：0 无多余小数点）
      let formattedData = data.map((item, rowIndex) => {
        const row = {};
        columns.forEach((col, colIndex) => {
          const {
            key,
            title,
            formatFn,
            type = "string",
            dateFormat = "yyyy-mm-dd",
            decimalPlaces = 2,
          } = col;
          try {
            let value = formatFn
              ? formatFn(item, key, rowIndex)
              : getNestedValue(item, key);

            switch (type.toLowerCase()) {
              case "number":
                // 处理空值/异常值
                const numValue =
                  value === "" || value === null ? 0 : Number(value) || 0;

                // 核心修复：根据数值和小数位配置，智能处理显示格式
                if (decimalPlaces === 0) {
                  // 整数配置：强制取整，0 显示为 0（无小数点）
                  row[title] = Math.round(numValue);
                } else {
                  // 小数配置：仅当数值不是整数时保留小数位，0 显示为 0
                  const roundedValue = Number(numValue.toFixed(decimalPlaces));
                  row[title] =
                    roundedValue === Math.round(roundedValue)
                      ? Math.round(roundedValue) // 整数（含 0）：显示为整数
                      : roundedValue; // 小数：显示对应小数位
                  console.log("aaaaaa", row[title]);
                }
                break;
              case "date":
                const date = new Date(value);
                row[title] = isNaN(date.getTime()) ? "" : date;
                break;
              case "string":
              default:
                row[title] =
                  value === null || value === undefined ? "" : String(value);
                break;
            }
          } catch (err) {
            // 异常时按配置返回默认值（0 无小数点）
            const zero = 0;
            row[title] =
              type === "number"
                ? decimalPlaces === 0
                  ? 0
                  : 0 === Math.round(0)
                  ? 0
                  : Number(zero.toFixed(decimalPlaces))
                : "";
          }
        });
        return row;
      });

      // 6. 过滤空行
      if (ignoreEmptyRows) {
        const filteredData = formattedData.filter((row) => {
          return Object.values(row).some((value) => {
            if (value instanceof Date) return true;
            if (typeof value === "number") return !isNaN(value);
            return value !== "" && value !== null && value !== undefined;
          });
        });
        if (filteredData.length === 0) {
          console.warn(`Sheet [${sheetName}] 过滤空行后无有效数据，已跳过`);
          continue;
        }
        formattedData = filteredData;
      }

      // 7. 构建 Sheet
      const worksheet = XLSX.utils.json_to_sheet(formattedData, {
        header: headers,
        skipHeader: false,
      });

      // 8. 配置列宽
      worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

      // 9. 设置单元格格式（同步修复：0 无多余小数点）
      setCellFormats(worksheet, formattedData.length, columns);

      // 10. 处理重复 Sheet 名称
      const finalSheetName = checkDuplicateSheetName(
        workbook,
        sheetName,
        sheetIndex
      );
      XLSX.utils.book_append_sheet(workbook, worksheet, finalSheetName);
    }

    // 11. 检查有效 Sheet
    if (workbook.SheetNames.length === 0) {
      console.error("导出失败：所有 Sheet 过滤后均无有效数据");
      alert("导出失败：无有效数据可导出");
      return false;
    }

    // 12. 导出文件
    XLSX.writeFile(workbook, `${finalFileName}.xlsx`, {
      bookType: "xlsx",
      type: "buffer",
      cellDates: true,
    });

    console.log(`文件导出成功：${finalFileName}.xlsx`);
    return true;
  } catch (error) {
    console.error("XLSX 导出核心错误：", error);
    alert("导出失败，请刷新页面重试！");
    return false;
  }
};

/**
 * 单 Sheet 导出（简化版）
 */
export const exportSingleSheetXlsx = (config) => {
  const {
    columns,
    data,
    sheetName = "数据报表",
    ignoreEmptyRows = true,
    fileName,
  } = config;
  return exportMultiSheetXlsx({
    sheets: [{ sheetName, columns, data, ignoreEmptyRows }],
    fileName,
  });
};

/**
 * 辅助函数：解析嵌套字段（支持 'a.b.c' 格式）
 */
const getNestedValue = (obj, key) => {
  if (!obj || typeof obj !== "object" || !key) return "";
  return key.split(".").reduce((acc, curr) => {
    return acc !== null && acc !== undefined ? acc[curr] : "";
  }, obj);
};

/**
 * 辅助函数：处理重复 Sheet 名称
 */
const checkDuplicateSheetName = (workbook, sheetName, index) => {
  const existingNames = workbook.SheetNames;
  return existingNames.includes(sheetName)
    ? `${sheetName}_${index + 1}`
    : sheetName;
};

/**
 * 辅助函数：设置单元格格式（修复 0 多余小数点）
 * @param {Object} worksheet - Sheet 对象
 * @param {number} dataLength - 数据行数（不含表头）
 * @param {Object[]} columns - 列配置
 */
const setCellFormats = (worksheet, dataLength, columns) => {
  const colIndexMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  columns.forEach((col, colIndex) => {
    const {
      type = "string",
      dateFormat = "yyyy-mm-dd",
      decimalPlaces = 2,
    } = col;
    const colLetter = colIndexMap[colIndex];
    let cellFormat = "";

    switch (type.toLowerCase()) {
      case "number":
        if (decimalPlaces === 0) {
          cellFormat = "0"; // 整数格式：0 → 0（无小数点）
        } else {
          // 修复后格式：整数（含0）显示为整数，小数显示对应位数
          // Excel 格式码：0.### 改为 #,##0.###（兼容大数字，且 0 显示为 0）
          cellFormat = `#,##0.${"#".repeat(decimalPlaces)}`;
        }
        break;
      case "date":
        cellFormat =
          dateFormat === "yyyy-mm-dd hh:mm:ss"
            ? "yyyy-mm-dd hh:mm:ss"
            : "yyyy-mm-dd";
        break;
      case "string":
      default:
        cellFormat = "@";
        break;
    }

    // 应用格式到整列
    for (let rowIndex = 1; rowIndex <= dataLength + 1; rowIndex++) {
      const cellKey = `${colLetter}${rowIndex}`;
      const cell = worksheet[cellKey];
      if (!cell) continue;

      cell.z = cellFormat;
      // 日期类型设置单元格类型
      if (type.toLowerCase() === "date" && cell.v instanceof Date) {
        cell.t = "d";
      }
    }
  });
};

/**
 * 使用方式
 */
// ==================== 单 Sheet 导出相关配置 ====================  开始
// 1. 单 Sheet 模拟数据（含嵌套字段、0值、整数、小数、日期、空行）
const singleSheetData = [
  { 
    id: 1, 
    user: { name: '张三', dept: '技术部' }, // 嵌套字段
    age: 25, 
    salary: 15000, // 整数
    bonus: 2345.67, // 2位小数
    rate: 0.85, // 1位小数（decimalPlaces=4 时显示 0.85）
    joinTime: '2023-01-15', // 日期字符串
    status: 1 
  },
  { 
    id: 2, 
    user: { name: '李四', dept: '产品部' },
    age: 28, 
    salary: 18000.5, // 1位小数
    bonus: 3456.123, // 3位小数（decimalPlaces=2 时显示 3456.12）
    rate: 0.9, // 1位小数
    joinTime: new Date('2022-05-20'), // Date 对象
    status: 0 // 0值（无小数点）
  },
  { 
    id: 3, 
    user: { name: '王五', dept: '运营部' },
    age: 30, 
    salary: 16500.89, // 2位小数
    bonus: 0, // 0值（无小数点）
    rate: 0.789, // 3位小数
    joinTime: '2021-09-30',
    status: 1 
  },
  {}, // 空行（会被过滤）
  { 
    id: 4, 
    user: { name: '赵六', dept: '市场部' },
    age: '32', // 字符串格式整数
    salary: '20000.123', // 字符串格式小数
    bonus: 4567.1234, // 4位小数（decimalPlaces=3 时显示 4567.123）
    rate: 1.0, // 整数（显示 1）
    joinTime: '2020-03-10',
    status: 1 
  },
  { 
    id: 5, 
    user: { name: '', dept: '' }, // 部分字段为空
    age: '', 
    salary: 0.0, // 0值（无小数点）
    bonus: '', 
    rate: 0.00, // 0值（无小数点）
    joinTime: '',
    status: 0 
  }
];

// 2. 单 Sheet 列配置
const singleSheetColumns = [
  { 
    key: 'id', 
    title: '员工ID', 
    type: 'number', 
    decimalPlaces: 0, // 整数
    width: 10 
  },
  { 
    key: 'user.name', 
    title: '姓名', 
    type: 'string', 
    width: 12,
    formatFn: (item) => item.user.name || '未知姓名' // 格式化空值
  },
  { 
    key: 'user.dept', 
    title: '部门', 
    type: 'string', 
    width: 12 
  },
  { 
    key: 'age', 
    title: '年龄', 
    type: 'number', 
    decimalPlaces: 0, // 整数
    width: 8 
  },
  { 
    key: 'salary', 
    title: '基础薪资', 
    type: 'number', 
    decimalPlaces: 2, // 2位小数（0 显示为 0）
    width: 14 
  },
  { 
    key: 'bonus', 
    title: '绩效奖金', 
    type: 'number', 
    decimalPlaces: 3, // 3位小数（0 显示为 0）
    width: 14 
  },
  { 
    key: 'rate', 
    title: '绩效系数', 
    type: 'number', 
    decimalPlaces: 4, // 4位小数（0.85 显示为 0.85）
    width: 12 
  },
  { 
    key: 'joinTime', 
    title: '入职时间', 
    type: 'date', 
    dateFormat: 'yyyy-mm-dd', // 日期格式
    width: 16,
    formatFn: (item) => item.joinTime ? new Date(item.joinTime) : '' // 日期格式化
  },
  { 
    key: 'status', 
    title: '状态', 
    type: 'string', 
    width: 10,
    formatFn: (item) => item.status === 1 ? '在职' : '离职' // 状态映射
  }
];
// 3. 执行单 Sheet 导出
exportSingleSheetXlsx({
  fileName: '员工基础信息报表_2025', // 导出文件名
  sheetName: '员工信息', // Sheet 名称
  columns: singleSheetColumns, // 列配置
  data: singleSheetData, // 数据
  ignoreEmptyRows: true // 启用空行过滤（默认 true，可省略）
});
// ==================== 单 Sheet 导出相关配置 ====================  结束


// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================
// ================================================================================


// ==================== 多 Sheet 导出相关配置 ==================== 开始
const multiSheetData = {
  // Sheet1 数据（复用单 Sheet 数据的子集）
  baseInfoData: singleSheetData.map(item => ({
    id: item.id,
    name: item.user.name,
    dept: item.user.dept,
    age: item.age,
    joinTime: item.joinTime,
    status: item.status
  })),
  // Sheet2 数据（薪资明细）
  salaryData: singleSheetData.map(item => ({
    id: item.id,
    name: item.user.name,
    salary: item.salary,
    bonus: item.bonus,
    total: item.salary + (item.bonus || 0), // 计算总薪资
    rate: item.rate
  }))
};
const multiSheetColumns = {
  // Sheet1 列配置（基础信息）
  baseInfoColumns: [
    { key: 'id', title: '员工ID', type: 'number', decimalPlaces: 0, width: 10 },
    { key: 'name', title: '姓名', type: 'string', width: 12 },
    { key: 'dept', title: '部门', type: 'string', width: 12 },
    { key: 'age', title: '年龄', type: 'number', decimalPlaces: 0, width: 8 },
    { key: 'joinTime', title: '入职时间', type: 'date', dateFormat: 'yyyy-mm-dd', width: 16 },
    { key: 'status', title: '状态', type: 'string', width: 10, formatFn: (item) => item.status === 1 ? '在职' : '离职' }
  ],
  // Sheet2 列配置（薪资明细）
  salaryColumns: [
    { key: 'id', title: '员工ID', type: 'number', decimalPlaces: 0, width: 10 },
    { key: 'name', title: '姓名', type: 'string', width: 12 },
    { key: 'salary', title: '基础薪资', type: 'number', decimalPlaces: 2, width: 14 },
    { key: 'bonus', title: '绩效奖金', type: 'number', decimalPlaces: 3, width: 14 },
    { key: 'total', title: '总薪资', type: 'number', decimalPlaces: 2, width: 14 },
    { key: 'rate', title: '绩效系数', type: 'number', decimalPlaces: 4, width: 12 }
  ]
};
exportMultiSheetXlsx({
  fileName: '员工综合报表_2025', // 统一文件名
  sheets: [
    // Sheet1：员工基础信息
    {
      sheetName: '基础信息',
      columns: multiSheetColumns.baseInfoColumns,
      data: multiSheetData.baseInfoData,
      ignoreEmptyRows: true
    },
    // Sheet2：员工薪资明细
    {
      sheetName: '薪资明细',
      columns: multiSheetColumns.salaryColumns,
      data: multiSheetData.salaryData,
      ignoreEmptyRows: true
    }
  ]
});
// ==================== 多 Sheet 导出相关配置 ==================== 结束