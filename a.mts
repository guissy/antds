
import { $, cd, fs, glob } from "zx";

const coms = ['Affix', 'Alert', 'Anchor', 'AutoComplete', 'Avatar', 'BackTop', 'Badge', 'Breadcrumb', 'Button', 'Calendar', 'Card', 'Carousel', 'Cascader', 'Checkbox', 'Col', 'Collapse', 'Comment', 'ConfigProvider', 'DatePicker', 'Descriptions', 'Divider', 'Drawer', 'Dropdown', 'Empty', 'Form', 'Grid', 'Image', 'Input', 'InputNumber', 'Layout', 'List', 'Mentions', 'Menu', 'message', 'Modal', 'notification', 'PageHeader', 'Pagination', 'Popconfirm', 'Popover', 'Progress', 'Radio', 'Rate', 'Result', 'Row', 'Segmented', 'Select', 'Skeleton', 'Slider', 'Space', 'Spin', 'Statistic', 'Steps', 'Switch', 'Table', 'Tabs', 'Tag', 'TimePicker', 'Timeline', 'Tooltip', 'Transfer', 'Tree', 'TreeSelect', 'Typography', 'Upload']

let map = new Map<string, number>();
(async () => {
    for await (let folder of ['model-magic-manager', 'magic-engine-2.0', 'magic-pipeline']) {
        await cd('~/Documents/' + folder)
        for await (let k of coms) {
            try {
                let c = await $`rg "from 'antd'" | grep ${k} | wc -l`;
                const count = parseInt(c.stdout);
                // arr.push([k, count])
                map.set(k, (map.get(k) || 0) + count)
                // console.log(k, count);
            } catch {
                console.log(k, 'e')
            }
        }
    }
    let arr = Array.from(map.entries())
    arr = arr.sort((a, b) => (a[1] > b[1] ? -1 : 1))
    console.table(arr)
})()

/**
┌─────────┬────────────────┬─────┐
│ (index) │    Component   │Count│
├─────────┼────────────────┼─────┤
│    0    │     Modal      │ 516 │
│    1    │     Button     │ 472 │
│    2    │      Form      │ 398 │
│    3    │     Input      │ 368 │
│    4    │     Table      │ 348 │
│    5    │     Select     │ 313 │
│    6    │    Tooltip     │ 266 │
│    7    │      Card      │ 225 │
│    8    │    message     │ 224 │
│    9    │      Row       │ 186 │
│   10    │      Col       │ 165 │
│   11    │     Radio      │ 162 │
│   12    │      List      │ 158 │
│   13    │     Result     │ 149 │
│   14    │  InputNumber   │ 109 │
│   15    │      Tabs      │ 104 │
│   16    │      Spin      │ 100 │
│   17    │    Popover     │ 95  │
│   18    │    Checkbox    │ 81  │
│   19    │     Layout     │ 78  │
│   20    │   DatePicker   │ 62  │
│   21    │      Tag       │ 52  │
│   22    │   Popconfirm   │ 48  │
│   23    │     Switch     │ 47  │
│   24    │     Space      │ 42  │
│   25    │     Upload     │ 34  │
│   26    │     Empty      │ 32  │
│   27    │     Slider     │ 29  │
│   28    │      Tree      │ 24  │
│   29    │      Menu      │ 23  │
│   30    │    Divider     │ 19  │
│   31    │   Statistic    │ 18  │
│   32    │    Progress    │ 17  │
│   33    │   Typography   │ 15  │
│   34    │    Dropdown    │ 14  │
│   35    │     Alert      │ 12  │
│   36    │    Collapse    │ 11  │
│   37    │   Pagination   │  9  │
│   38    │     Badge      │  8  │
│   39    │    Mentions    │  8  │
│   40    │  notification  │  8  │
│   41    │      Grid      │  7  │
│   42    │    Cascader    │  6  │
│   43    │ ConfigProvider │  5  │
│   44    │   TimePicker   │  5  │
│   45    │    Transfer    │  5  │
│   46    │  Descriptions  │  4  │
│   47    │    Skeleton    │  4  │
│   48    │     Steps      │  4  │
│   49    │    Comment     │  3  │
│   50    │     Image      │  2  │
│   51    │      Rate      │  2  │
│   52    │     Drawer     │  2  │
│   53    │    Calendar    │  1  │
│   54    │     Anchor     │  1  │
│   55    │     Avatar     │  1  │
│   56    │    Timeline    │  1  │
└─────────┴────────────────┴─────┘
 */