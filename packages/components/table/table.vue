<template>
    <div v-on="listeners" :class="['mvi-table', outBorder ? 'mvi-table-border' : '']">
        <div :class="['mvi-table-header', headClass || '']" v-if="columnsData.length != 0">
            <table cellpadding="0" cellspacing="0">
                <colgroup>
                    <col ref="headCols" :style="colgroupStyle(item, index)" v-for="(item, index) in columnsData" :key="'table-header-group-' + index" />
                    <col v-if="isScroll" :style="{ width: scrollWidth + 'px' }" />
                </colgroup>
                <thead>
                    <tr>
                        <th ref="ths" :class="tableHeaderThClass" v-for="(item, index) in columnsData" :key="'table-column-' + index">
                            <div>
                                <m-checkbox v-if="item.key == 'checkbox'" :icon="{ size:'0.24rem',color:item.iconColor || null,type:item.iconType || 'success'}" :class="item.value ? 'mvi-table-checkbox' : ''" v-model="selectAll" @model-change="allSelect" :fill-color="item.fillColor || null" :label="item.value || ''"></m-checkbox>
                                <span v-else-if="item.value" v-html="item.value"></span>
                                <span class="mvi-table-sortable" v-if="item.sortable">
                                    <m-icon @click="sortAsc($event, item)" :class="['mvi-table-sortable-icon', item.key == sortBy && sortMethod == 'asc' ? 'mvi-table-sortable-icon-active' : '']" :type="(sortIcon && sortIcon.length == 2 && sortIcon[0])? sortIcon[0] : 'caret-up'" :color="sortActiveColor ? (item.key == sortBy && sortMethod == 'asc' ? sortActiveColor : null) : null" />
                                    <m-icon @click="sortDesc($event, item)" :class="['mvi-table-sortable-icon', item.key == sortBy && sortMethod == 'desc' ? 'mvi-table-sortable-icon-active' : '']" :type="(sortIcon && sortIcon.length == 2 && sortIcon[1])? sortIcon[1] : 'caret-down'" :color="sortActiveColor ? (item.key == sortBy && sortMethod == 'desc' ? sortActiveColor : null) : null" />
                                </span>
                            </div>
                        </th>
                        <th v-if="isScroll" :style="{ width: scrollWidth + 'px' }"></th>
                    </tr>
                </thead>
            </table>
        </div>
        <div v-if="loading" class="mvi-table-loading">
            <div>
                <m-loading color="#c8c9cc" size="0.3rem"></m-loading>
                <div class="mvi-table-loading-text" v-html="loadText"></div>
            </div>
        </div>
        <div v-else-if="sortData.length == 0" class="mvi-table-no-data" v-html="noDataMsg"></div>
        <div v-else class="mvi-table-body" :style="bodyStyle" ref="body">
            <table cellpadding="0" cellspacing="0">
                <colgroup>
                    <col ref="bodyCols" :style="colgroupStyle(item, index)" v-for="(item, index) in columnsData" :key="'table-body-group-' + index" />
                </colgroup>
                <tbody>
                    <tr v-for="(item, index) in sortData" :key="'table-data-' + index" :class="bodyTrClass(item, index)">
                        <td :class="[
								rowBorder ? 'mvi-table-body-td-border' : '',
								item.cellClassName && item.cellClassName[item2.key] ? item.cellClassName[item2.key] : '',
								item2.className || '',
								cellClass(item, index, item2, index2) || ''
							]" v-for="(item2, index2) in columnsData" :key="'table-column-data-' + index2" @click="cellClick($event, item, index, item2, index2)">
                            <m-checkbox v-if="item2.key == 'checkbox'" :icon="{ size:'0.24rem',color:item.iconColor || null,type:item.iconType || 'success'}" v-model="checkRows" :value="index" @model-change="selectCheck" :fill-color="item2.fillColor || null" :disabled="item.checkDisabled"></m-checkbox>
                            <slot name="custom" :row="item" :column="item2" :row-index="index" :column-index="index2" v-if="item2.key == 'custom' && $scopedSlots.custom"></slot>
                            <span v-else v-html="textFilter(item, item2)"></span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import $dap from 'dap-util'
import mIcon from '../icon/icon'
import mCheckbox from '../checkbox/checkbox'
import mLoading from '../loading/loading'
export default {
    name: 'm-table',
    data() {
        return {
            //选择的列
            checkRows: [],
            //是否全选
            selectAll: false,
            //渲染在表格上的数据
            sortData: [],
            //表格内容是否有垂直滚动条
            isScroll: false,
            //滚动条宽度
            scrollWidth: 0,
            //排序的字段，即依据此字段排序
            sortBy: '',
            //排序方式，asc还是desc
            sortMethod: ''
        }
    },
    props: {
        //表格内容数据
        data: {
            type: Array,
            default: function () {
                return []
            }
        },
        //表格头数据
        columns: {
            type: Array,
            default: function () {
                return []
            }
        },
        //是否显示外边框
        outBorder: {
            type: Boolean,
            default: false
        },
        //是否显示行边框
        rowBorder: {
            type: Boolean,
            default: false
        },
        //是否显示条纹
        stripe: {
            type: Boolean,
            default: false
        },
        //设置表格主体高度，固定表格头部
        height: {
            type: String,
            default: null
        },
        //设置行样式
        rowClass: {
            type: String,
            default: null
        },
        //自定义单元格样式
        cellClass: {
            type: Function,
            default: function () {}
        },
        //无数据的文本提示
        noDataMsg: {
            type: String,
            default: '暂时没有数据'
        },
        //是否加载状态
        loading: {
            type: Boolean,
            default: false
        },
        //加载时的文本提示
        loadText: {
            type: String,
            default: '正在加载数据...'
        },
        //表头样式
        headClass: {
            type: String,
            default: null
        },
        //自定义升序排序
        customSortAsc: {
            type: Function,
            default: null
        },
        //自定义降序排序
        customSortDesc: {
            type: Function,
            default: null
        },
        //排序激活颜色
        sortActiveColor: {
            type: String,
            default: null
        },
        //自定义排序图标
        sortIcon: {
            type: Array,
            default: null
        }
    },
    computed: {
        listeners() {
            return Object.assign({}, this.$listeners)
        },
        bodyTrClass() {
            return (item, index) => {
                let cls = []
                if (this.rowClass) {
                    cls.push(this.rowClass)
                }
                if (item.className) {
                    cls.push(item.className)
                }
                if (index % 2 == 1 && this.stripe) {
                    cls.push('mvi-table-stripe')
                }
                return cls
            }
        },
        tableHeaderThClass() {
            let cls = ['mvi-table-header-th']
            if (this.rowBorder) {
                cls.push('mvi-table-header-th-border')
            }
            return cls
        },
        bodyStyle() {
            let style = {}
            if (this.height) {
                style.maxHeight = this.height
                style.overflow = 'auto'
            }
            return style
        },
        colgroupStyle() {
            return item => {
                let style = {}
                if (item.width) {
                    style.width = item.width
                }
                return style
            }
        },
        columnsData() {
            let arr = []
            this.columns.forEach(column => {
                if (!column.hidden) {
                    arr.push(column)
                }
            })
            return arr
        },
        textFilter() {
            return (item, item2) => {
                let text = item[item2.key]
                if (typeof item2.filter == 'function') {
                    text = item2.filter(item[item2.key])
                }
                return text
            }
        }
    },
    components: {
        mIcon,
        mCheckbox,
        mLoading
    },
    watch: {
        data(newValue) {
            this.sortData = this.getSortData()
            this.$nextTick(() => {
                this.columnsAlign()
            })
        },
        loading(newValue) {
            this.$nextTick(() => {
                this.columnsAlign()
            })
        }
    },
    created() {
        this.sortData = this.getSortData()
    },
    mounted() {
        this.columnsAlign()
        $dap.event.on(window, `resize.table_${this._uid}`, this.columnsAlign)
    },
    methods: {
        //重置排序状态
        resetSortActive() {
            this.sortBy = ''
            this.sortMethod = ''
            if (
                typeof this.customSortAsc != 'function' &&
                typeof this.customSortDesc != 'function'
            ) {
                this.sortData = this.getSortData()
                this.$nextTick(() => {
                    this.columnsAlign()
                })
            }
        },
        //表头表主体对齐设置
        columnsAlign() {
            if (this.$refs.body) {
                //判断表格主体是否含有滚动条，与表头对齐设置
                this.isScroll =
                    $dap.element.getScrollHeight(this.$refs.body) >
                    this.$refs.body.clientHeight
                if (this.isScroll) {
                    this.scrollWidth =
                        this.$refs.body.offsetWidth -
                        this.$refs.body.clientWidth
                }
                this.$nextTick(() => {
                    if (this.$refs.ths) {
                        this.$refs.ths.forEach((el, index) => {
                            if (
                                !this.columnsData[index].width &&
                                this.$refs.headCols &&
                                this.$refs.headCols[index] &&
                                this.$refs.bodyCols &&
                                this.$refs.bodyCols[index]
                            ) {
                                this.$refs.headCols[index].style.width =
                                    this.$refs.bodyCols[index].style.width =
                                        el.offsetWidth + 'px'
                            }
                        })
                    }
                })
            }
        },
        //点击单元格
        cellClick(event, item, index, item2, index2) {
            this.$emit('cell-click', {
                row: item,
                rowIndex: index,
                column: item2,
                columnIndex: index2
            })
        },
        //选择单个复选框
        selectCheck(value) {
            event.stopPropagation()
            let length = 0
            for (let i = 0; i < this.sortData.length; i++) {
                if (!this.sortData[i].checkDisabled) {
                    length++
                }
            }
            if (this.checkRows.length == length) {
                this.selectAll = true
            } else {
                this.selectAll = false
            }
            let checkRowsData = []
            let length2 = this.sortData.length
            this.checkRows.forEach(item => {
                for (let i = 0; i < length2; i++) {
                    if (i == item) {
                        checkRowsData.push(this.sortData[i])
                        break
                    }
                }
            })
            this.$emit('check', checkRowsData)
        },
        //复选框全选
        allSelect(value) {
            this.checkRows = []
            if (value) {
                //全选
                for (let i = 0; i < this.sortData.length; i++) {
                    if (!this.sortData[i].checkDisabled) {
                        this.checkRows.push(i)
                    }
                }
            } else {
                this.checkRows = []
            }
            let checkRowsData = []
            let length = this.sortData.length
            this.checkRows.forEach(item => {
                for (let i = 0; i < length; i++) {
                    if (i == item) {
                        checkRowsData.push(this.sortData[i])
                        break
                    }
                }
            })
            this.$emit('check', checkRowsData)
        },
        //升序排序
        sortAsc(event, column) {
            this.sortBy = column.key
            this.sortMethod = 'asc'
            if (typeof this.customSortAsc == 'function' && this.customSortAsc) {
                this.customSortAsc(column, this.sortData)
            } else {
                this.sortData = this.sortData.sort((a, b) => {
                    if (
                        $dap.number.isNumber(a[column.key]) &&
                        $dap.number.isNumber(b[column.key])
                    ) {
                        return a[column.key] - b[column.key]
                    }
                    let str1 = a[column.key].toString()
                    let str2 = b[column.key].toString()
                    return str1.localeCompare(str2, 'zh-CN')
                })
                this.$emit('sort-asc', this.sortData)
            }
        },
        //降序排序
        sortDesc(event, column) {
            this.sortBy = column.key
            this.sortMethod = 'desc'
            if (
                typeof this.customSortDesc == 'function' &&
                this.customSortDesc
            ) {
                this.customSortDesc(column, this.sortData)
            } else {
                this.sortData = this.sortData.sort((a, b) => {
                    if (
                        $dap.number.isNumber(a[column.key]) &&
                        $dap.number.isNumber(b[column.key])
                    ) {
                        return b[column.key] - a[column.key]
                    }
                    let str1 = a[column.key].toString()
                    let str2 = b[column.key].toString()
                    return -str1.localeCompare(str2, 'zh-CN')
                })
                this.$emit('sort-desc', this.sortData)
            }
        },
        //根据data获取sortData
        getSortData() {
            return this.data.filter(row => {
                return !row.hidden
            })
        }
    },
    beforeDestroy() {
        $dap.event.off(window, `resize.table_${this._uid}`)
    }
}
</script>

<style lang="less" scoped>
@import '../../css/mvi-basic.less';

.mvi-table {
    display: block;
    width: 100%;
    padding: 0;
    margin: 0;
    background-color: #fff;
    font-size: @font-size-default;
    color: @font-color-default;
}

.mvi-table-border {
    border: 1px solid @border-color;
    border-radius: @radius-default;
}

.mvi-table-header {
    display: flex;
    display: -webkit-flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    background-color: @bg-color-dark;
    border-top-left-radius: @radius-default;
    border-top-right-radius: @radius-default;
    border-bottom: 1px solid @border-color;

    table {
        width: 100%;
        border-collapse: collapse;
    }

    thead {
        width: 100%;
    }

    th.mvi-table-header-th {
        padding: @mp-sm;
        text-align: center;
        font-weight: bold;

        & > div {
            display: inline-flex;
            display: -webkit-inline-flex;
            justify-content: flex-start;
            align-items: center;
            height: 100%;
            vertical-align: middle;
        }

        .mvi-table-sortable {
            display: inline-flex;
            display: -webkit-inline-flex;
            justify-content: space-between;
            flex-direction: column;
            -ms-flex-direction: column;
            -webkit-flex-direction: column;
            margin-left: @mp-xs;
            color: @font-color-mute;
            height: 100%;

            .mvi-table-sortable-icon {
                font-size: 0.6em;
                width: 100%;
                margin-bottom: 0;
            }

            .mvi-table-sortable-icon.mvi-table-sortable-icon-active {
                color: @info-normal;
            }
        }
    }

    th.mvi-table-header-th.mvi-table-header-th-border {
        border: 1px solid @border-color;
        border-bottom: none;
        border-top: none;
    }

    tr > th.mvi-table-header-th.mvi-table-header-th-border:first-child {
        border-left: none;
    }

    tr > th.mvi-table-header-th.mvi-table-header-th-border:last-child {
        border-right: none;
    }

    .mvi-table-checkbox {
        margin-right: @mp-xs / 2;
    }
}

.mvi-table-body {
    display: block;
    width: 100%;

    table {
        width: 100%;
        border-collapse: collapse;
    }

    tr.mvi-table-stripe {
        background-color: @bg-color-default;
    }

    td {
        padding: @mp-sm;
        text-align: center;
        border-bottom: 1px solid @border-color;
    }

    tr:last-child > td {
        border-bottom: none;
    }

    td.mvi-table-body-td-border {
        border-left: 1px solid @border-color;
        border-right: 1px solid @border-color;
    }

    tr > td.mvi-table-body-td-border:first-child {
        border-left: none;
    }

    tr > td.mvi-table-body-td-border:last-child {
        border-right: none;
    }
}

.mvi-table-loading {
    display: flex;
    display: -webkit-flex;
    justify-content: center;
    align-items: center;
    padding: @mp-lg 0;

    & > div {
        display: flex;
        display: -webkit-flex;
        justify-content: flex-start;
        align-items: center;
    }

    .mvi-table-loading-text {
        color: @font-color-mute;
        font-size: @font-size-small;
        margin-left: @mp-xs;
    }
}

.mvi-table-no-data {
    display: block;
    width: 100%;
    text-align: center;
    padding: @mp-lg 0;
    color: @font-color-mute;
    font-size: @font-size-small;
}
</style>
